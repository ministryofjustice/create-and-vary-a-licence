import { Request, Response } from 'express'
import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import LicenceService from '../../../../../services/licenceService'
import AddressService from '../../../../../services/addressService'
import PathType from '../../../../../enumeration/pathType'
import config from '../../../../../config'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../../enumeration/userType'
import { AddressResponse, Licence } from '../../../../../@types/licenceApiClientTypes'

jest.mock('../../initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const addressService = new AddressService(null) as jest.Mocked<AddressService>

describe('InitialMeetingPlaceRoutes', () => {
  let req: Request
  let res: Response
  let formAddress: Record<string, string>
  let licence: Licence
  let user: { username: string }

  const preferredAddresses: AddressResponse[] = [
    {
      uprn: '123456789',
      reference: 'ref123',
      firstLine: '123 Test Street',
      secondLine: 'Test Area',
      townOrCity: 'Test City',
      county: 'Test County',
      postcode: 'TE1 2ST',
      source: 'OS_PLACES',
    },
  ]

  beforeEach(() => {
    formAddress = {
      addressLine1: 'Manchester Probation Service',
      addressLine2: 'Unit 4',
      addressTown: 'Smith Street',
      addressCounty: 'Stockport',
      addressPostcode: 'SP1 3DN',
    }

    licence = {
      id: 1,
      appointmentAddress: 'Manchester Probation Service, Unit 4, Smith Street, Stockport, SP1 3DN',
      conditionalReleaseDate: '14/05/2022',
      isEligibleForEarlyRelease: true,
    } as Licence

    user = {
      username: 'joebloggs',
    }

    req = {
      params: { licenceId: 1 },
      body: formAddress,
      flash: jest.fn(),
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence,
      },
    } as unknown as Response

    config.postcodeLookupEnabled = false

    licenceService.updateAppointmentAddress = jest.fn()
    addressService.getPreferredAddresses = jest.fn()
    addressService.addAppointmentAddress = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
    config.postcodeLookupEnabled = false
  })

  describe('GET', () => {
    it('Given PathType.CREATE, When GET called, Then should render create view', async () => {
      // Given
      const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)

      // When
      await handler.GET(req as Request, res as Response)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
        action: 'create',
        preferredAddresses: [],
        formAddress,
        continueOrSaveLabel: 'Continue',
        manualAddressEntryUrl: '/licence/time-served/create/id/1/manual-address-entry',
      })
    })

    it('Given PathType.EDIT, When GET called, Then should render edit view', async () => {
      // Given
      const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)

      // When
      await handler.GET(req as Request, res as Response)

      // Then
      expect(res.render).toHaveBeenCalledWith(
        'pages/initialAppointment/prisonCreated/initialMeetingPlace',
        expect.objectContaining({
          action: 'edit',
          preferredAddresses: [],
          formAddress,
          continueOrSaveLabel: 'Save',
          manualAddressEntryUrl: '/licence/time-served/edit/id/1/manual-address-entry',
        }),
      )
    })

    it('Given postcode lookup enabled, When GET called, Then should fetch preferred addresses', async () => {
      // Given
      config.postcodeLookupEnabled = true
      addressService.getPreferredAddresses.mockResolvedValue(preferredAddresses)
      const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)

      // When
      await handler.GET(req as Request, res as Response)

      // Then
      expect(addressService.getPreferredAddresses).toHaveBeenCalledWith(user)

      expect(res.render).toHaveBeenCalledWith(
        'pages/initialAppointment/prisonCreated/initialMeetingPlace',
        expect.objectContaining({
          action: 'edit',
          preferredAddresses,
          formAddress,
          continueOrSaveLabel: 'Save',
          manualAddressEntryUrl: '/licence/time-served/edit/id/1/manual-address-entry',
        }),
      )
    })

    it('should render view with addressRemoved message', async () => {
      config.postcodeLookupEnabled = true
      addressService.getPreferredAddresses.mockResolvedValue(preferredAddresses)
      const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)
      const flash = req.flash as jest.Mock
      flash.mockReturnValueOnce(['Address removed'])
      await handler.GET(req as Request, res as Response)
      expect(req.flash).toHaveBeenCalledWith('addressRemoved')
      expect(res.render).toHaveBeenCalledWith(
        'pages/initialAppointment/prisonCreated/initialMeetingPlace',
        expect.objectContaining({
          action: 'edit',
          preferredAddresses,
          formAddress,
          continueOrSaveLabel: 'Save',
          manualAddressEntryUrl: '/licence/time-served/edit/id/1/manual-address-entry',
          addressRemoved: 'Address removed',
        }),
      )
    })
  })

  describe('POST', () => {
    it('Given PathType.CREATE, When POST called, Then should update address and redirect', async () => {
      // Given
      const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)

      // When
      await handler.POST(req as Request, res as Response)

      // Then
      expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, formAddress, user)
      expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, licence, UserType.PRISON)
      expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/create/id/1/initial-meeting-contact')
    })

    it('Given PathType.EDIT and licence status IN_PROGRESS, When POST called, Then should redirect to check-your-answers', async () => {
      // Given
      licence.statusCode = 'IN_PROGRESS'
      const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)

      // When
      await handler.POST(req as Request, res as Response)

      // Then
      expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/id/1/check-your-answers')
      expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, req.body, user)
    })

    it('Given postcode lookup enabled and searchQuery provided, When POST called, Then should redirect to select-address', async () => {
      // Given
      config.postcodeLookupEnabled = true
      req.body = { searchQuery: 'SW1A 1AA' }
      const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)

      // When
      await handler.POST(req as Request, res as Response)

      // Then
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/time-served/create/id/1/select-address?searchQuery=SW1A%201AA',
      )
      expect(licenceService.updateAppointmentAddress).not.toHaveBeenCalled()
      expect(flashInitialApptUpdatedMessage).not.toHaveBeenCalled()
    })

    it('Given postcode lookup enabled and preferredAddress provided, When POST called, Then should call addAppointmentAddress', async () => {
      // Given
      config.postcodeLookupEnabled = true
      const preferredAddress = {
        uprn: '987654',
        firstLine: '1 Test Road',
        secondLine: 'Suite 2',
        townOrCity: 'Testville',
        county: 'Testshire',
        postcode: 'TE5 7ST',
        source: 'test-source',
      }
      req.body = { preferredAddress: JSON.stringify(preferredAddress) }
      const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)

      // When
      await handler.POST(req as Request, res as Response)

      // Then
      expect(addressService.addAppointmentAddress).toHaveBeenCalledWith(
        licence.id,
        { ...preferredAddress, isPreferredAddress: false },
        user,
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/id/1/check-your-answers')
      expect(licenceService.updateAppointmentAddress).not.toHaveBeenCalled()
    })
  })
})
