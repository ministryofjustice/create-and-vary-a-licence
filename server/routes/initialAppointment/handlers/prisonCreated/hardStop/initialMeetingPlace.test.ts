import { Request, Response } from 'express'

import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import Address from '../../../types/address'
import PathType from '../../../../../enumeration/pathType'
import AddressService from '../../../../../services/addressService'
import { AddressResponse } from '../../../../../@types/licenceApiClientTypes'

const addressService = new AddressService(null) as jest.Mocked<AddressService>

jest.mock('../../../../../services/addressService')

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
          appointmentType: 'RESPONSIBLE_COM',
          conditionalReleaseDate: '14/05/2022',
          isEligibleForEarlyRelease: true,
        },
      },
    } as unknown as Response
    addressService.getPreferredAddresses.mockResolvedValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Hardstop licence prison user journey', () => {
    let handler = new InitialMeetingPlaceRoutes(addressService, PathType.CREATE)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
          action: 'create',
          preferredAddresses: [],
          formAddress,
          continueOrSaveLabel: 'Continue',
          manualAddressEntryUrl: '/licence/hard-stop/create/id/1/manual-address-entry',
          noAppointmentNeeded: false,
        })
      })

      it('should render view with save Label and manual address entry URL', async () => {
        handler = new InitialMeetingPlaceRoutes(addressService, PathType.EDIT)
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
          action: 'edit',
          preferredAddresses: [],
          formAddress,
          continueOrSaveLabel: 'Save',
          manualAddressEntryUrl: '/licence/hard-stop/edit/id/1/manual-address-entry',
          noAppointmentNeeded: false,
        })
      })

      it('should render view with fromReviewParam and preferredAddresses', async () => {
        handler = new InitialMeetingPlaceRoutes(addressService, PathType.EDIT)
        addressService.getPreferredAddresses.mockResolvedValue(preferredAddresses)
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPlace', {
          action: 'edit',
          preferredAddresses,
          formAddress,
          continueOrSaveLabel: 'Save',
          manualAddressEntryUrl: '/licence/hard-stop/edit/id/1/manual-address-entry',
          noAppointmentNeeded: false,
        })
      })

      it('should render view with addressRemovedMessage', async () => {
        addressService.getPreferredAddresses.mockResolvedValue(preferredAddresses)
        const handler = new InitialMeetingPlaceRoutes(addressService, PathType.EDIT)
        const flash = req.flash as jest.Mock
        flash.mockReturnValueOnce(['Address removed'])
        await handler.GET(req as Request, res as Response)
        expect(req.flash).toHaveBeenCalledWith('addressRemovedMessage')
        expect(res.render).toHaveBeenCalledWith(
          'pages/initialAppointment/prisonCreated/initialMeetingPlace',
          expect.objectContaining({
            action: 'edit',
            preferredAddresses,
            formAddress,
            continueOrSaveLabel: 'Save',
            manualAddressEntryUrl: '/licence/hard-stop/edit/id/1/manual-address-entry',
            addressRemovedMessage: 'Address removed',
          }),
        )
      })
    })

    describe('POST', () => {
      it('should redirect to the initial meeting contact page', async () => {
        handler = new InitialMeetingPlaceRoutes(addressService, PathType.CREATE)
        await handler.POST(req, res)
        expect(addressService.addAppointmentAddress).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/initial-meeting-contact')
      })

      it('should redirect to the check your answers page page', async () => {
        handler = new InitialMeetingPlaceRoutes(addressService, PathType.EDIT)
        req = {
          params: {
            licenceId: 1,
          },
          body: formAddress,
          query: {},
        } as unknown as Request
        await handler.POST(req, res)
        expect(addressService.addAppointmentAddress).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
      })

      it('should redirect to /select-address in create flow if searchQuery is provided', async () => {
        const handler = new InitialMeetingPlaceRoutes(addressService, PathType.CREATE)
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
        expect(addressService.addAppointmentAddress).not.toHaveBeenCalled()
      })

      it('should redirect to /select-address in edit flow if searchQuery is provided', async () => {
        const handler = new InitialMeetingPlaceRoutes(addressService, PathType.EDIT)
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
        expect(addressService.addAppointmentAddress).not.toHaveBeenCalled()
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
        const handler = new InitialMeetingPlaceRoutes(addressService, PathType.EDIT)

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

      it('should redirect to licence contact number page if noAppointmentNeeded is true', async () => {
        const handler = new InitialMeetingPlaceRoutes(addressService, PathType.CREATE)
        res.locals.licence.appointmentPersonType = 'NO_APPOINTMENT_NEEDED'

        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith(
          `/licence/hard-stop/create/id/${req.params.licenceId}/licence-contact-number`,
        )
      })
    })
  })
})
