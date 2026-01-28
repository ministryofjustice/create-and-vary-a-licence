import { Request, Response } from 'express'

import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import LicenceService from '../../../../../services/licenceService'
import Address from '../../../types/address'
import UserType from '../../../../../enumeration/userType'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import PathType from '../../../../../enumeration/pathType'
import config from '../../../../../config'
import AddressService from '../../../../../services/addressService'
import { AddressResponse } from '../../../../../@types/licenceApiClientTypes'

jest.mock('../../initialMeetingUpdatedFlashMessage')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const addressService = new AddressService(null) as jest.Mocked<AddressService>

describe('Route Handlers - Create Licence - Initial Meeting Place', () => {
  let req: Request
  let res: Response
  let formAddress: Address
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
    } as unknown as Address

    req = {
      params: {
        licenceId: 1,
      },
      body: formAddress,
      query: {},
      flash: jest.fn(),
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence: {
          appointmentAddress: 'Manchester Probation Service, Unit 4, Smith Street, Stockport, SP1 3DN',
          conditionalReleaseDate: '14/05/2022',
          isEligibleForEarlyRelease: true,
        },
      },
    } as unknown as Response
    config.postcodeLookupEnabled = false

    licenceService.updateAppointmentAddress = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
    addressService.getPreferredAddresses = jest.fn()
    addressService.addAppointmentAddress = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
    config.postcodeLookupEnabled = false
  })

  describe('Hardstop licence prison user journey', () => {
    let handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
          action: 'create',
          preferredAddresses: [],
          formAddress,
          continueOrSaveLabel: 'Continue',
          manualAddressEntryUrl: '/licence/hard-stop/create/id/1/manual-address-entry',
        })
      })

      it('should render view with save Label and manual address entry URL', async () => {
        handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
          action: 'edit',
          preferredAddresses: [],
          formAddress,
          continueOrSaveLabel: 'Save',
          manualAddressEntryUrl: '/licence/hard-stop/edit/id/1/manual-address-entry',
        })
      })

      it('should render view with fromReviewParam and preferredAddresses when postcode lookup is enabled', async () => {
        handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)
        config.postcodeLookupEnabled = true
        addressService.getPreferredAddresses.mockResolvedValue(preferredAddresses)
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
          action: 'edit',
          preferredAddresses,
          formAddress,
          continueOrSaveLabel: 'Save',
          manualAddressEntryUrl: '/licence/hard-stop/edit/id/1/manual-address-entry',
        })
      })

      it('Given addressRemoved flash is set, When GET called, Then should render view with addressRemoved message', async () => {
        // Given
        config.postcodeLookupEnabled = true
        addressService.getPreferredAddresses.mockResolvedValue(preferredAddresses)
        const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)

        // Mock flash to return the message
        const flash = req.flash as jest.Mock
        flash.mockReturnValueOnce(['Address removed'])

        // When
        await handler.GET(req as Request, res as Response)

        // Then
        expect(req.flash).toHaveBeenCalledWith('addressRemoved')
        expect(res.render).toHaveBeenCalledWith(
          'pages/initialAppointment/prisonCreated/initialMeetingPlace',
          expect.objectContaining({
            action: 'edit',
            preferredAddresses,
            formAddress,
            continueOrSaveLabel: 'Save',
            manualAddressEntryUrl: '/licence/hard-stop/edit/id/1/manual-address-entry',
            addressRemoved: 'Address removed',
          }),
        )
      })
    })

    describe('POST', () => {
      it('should redirect to the initial meeting contact page', async () => {
        handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, formAddress, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/initial-meeting-contact')
      })

      it('should redirect to the check your answers page page', async () => {
        handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)
        req = {
          params: {
            licenceId: 1,
          },
          body: formAddress,
          query: {},
        } as unknown as Request
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentAddress).toHaveBeenCalledWith(1, formAddress, { username: 'joebloggs' })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })

      it('should not call updateAppointmentAddress', async () => {
        config.postcodeLookupEnabled = true
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentAddress).not.toHaveBeenCalled()
        expect(flashInitialApptUpdatedMessage).not.toHaveBeenCalledWith()
      })

      it('should redirect to /select-address in create flow if postcode lookup is enabled and searchQuery is provided', async () => {
        const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)
        config.postcodeLookupEnabled = true
        req = {
          params: {
            licenceId: 123,
          },
          body: {
            searchQuery: 'SW1A 1AA',
          },
        } as unknown as Request

        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/hard-stop/create/id/123/select-address?searchQuery=SW1A%201AA',
        )
        expect(licenceService.updateAppointmentAddress).not.toHaveBeenCalled()
        expect(flashInitialApptUpdatedMessage).not.toHaveBeenCalled()
      })

      it('should redirect to /select-address in edit flow if postcode lookup is enabled and searchQuery is provided', async () => {
        const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)
        config.postcodeLookupEnabled = true
        req = {
          params: {
            licenceId: 123,
          },
          body: {
            searchQuery: 'SW1A 1AA',
          },
        } as unknown as Request

        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/hard-stop/edit/id/123/select-address?searchQuery=SW1A%201AA',
        )
        expect(licenceService.updateAppointmentAddress).not.toHaveBeenCalled()
        expect(flashInitialApptUpdatedMessage).not.toHaveBeenCalled()
      })

      it('should parse preferredAddress and call addAppointmentAddress with correct arguments', async () => {
        const preferredAddress = {
          uprn: '987654',
          firstLine: '1 Test Road',
          secondLine: 'Suite 2',
          townOrCity: 'Testville',
          county: 'Testshire',
          postcode: 'TE5 7ST',
          source: 'test-source',
        }
        req = { ...req, body: { preferredAddress: JSON.stringify(preferredAddress) }, query: {} } as unknown as Request
        config.postcodeLookupEnabled = true
        const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)

        await handler.POST(req, res)

        expect(addressService.addAppointmentAddress).toHaveBeenCalledWith(
          req.params.licenceId,
          {
            ...preferredAddress,
            isPreferredAddress: false,
          },
          res.locals.user,
        )
        expect(res.redirect).toHaveBeenCalledWith(`/licence/hard-stop/id/${req.params.licenceId}/check-your-answers`)
      })
    })
  })
})
