import { Request, Response } from 'express'

import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import LicenceService from '../../../services/licenceService'
import Address from '../types/address'
import UserType from '../../../enumeration/userType'
import AddressService from '../../../services/addressService'
import { AddressResponse } from '../../../@types/licenceApiClientTypes'

jest.mock('../../../services/licenceService')
jest.mock('../../../services/addressService')

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

    addressService.getPreferredAddresses.mockResolvedValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Probation user journey', () => {
    const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, UserType.PROBATION)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingPlace', {
          formAddress,
          manualAddressEntryUrl: '/licence/create/id/1/manual-address-entry',
          preferredAddresses: [],
          noAppointmentNeeded: false,
        })
      })

      it('should render view with fromReviewParam', async () => {
        req.query.fromReview = 'true'
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingPlace', {
          formAddress,
          manualAddressEntryUrl: '/licence/create/id/1/manual-address-entry?fromReview=true',
          preferredAddresses: [],
          noAppointmentNeeded: false,
        })
      })

      it('should render view with preferredAddresses', async () => {
        addressService.getPreferredAddresses.mockResolvedValue(preferredAddresses)
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingPlace', {
          formAddress,
          manualAddressEntryUrl: '/licence/create/id/1/manual-address-entry',
          preferredAddresses,
          noAppointmentNeeded: false,
        })
      })

      it('should render view with addressRemovedMessage', async () => {
        addressService.getPreferredAddresses.mockResolvedValue(preferredAddresses)
        const flash = req.flash as jest.Mock
        flash.mockReturnValueOnce(['Address removed'])
        await handler.GET(req as Request, res as Response)
        expect(req.flash).toHaveBeenCalledWith('addressRemovedMessage')
        expect(res.render).toHaveBeenCalledWith(
          'pages/initialAppointment/initialMeetingPlace',
          expect.objectContaining({
            formAddress,
            manualAddressEntryUrl: '/licence/create/id/1/manual-address-entry',
            addressRemovedMessage: 'Address removed',
            noAppointmentNeeded: false,
          }),
        )
      })

      it('When the appointmentPersonType is NO_APPOINTMENT_NEEDED, noAppointmentNeeded should be true', async () => {
        res.locals.licence.appointmentPersonType = 'NO_APPOINTMENT_NEEDED'
        addressService.getPreferredAddresses.mockResolvedValue(preferredAddresses)
        await handler.GET(req as Request, res as Response)
        expect(res.render).toHaveBeenCalledWith(
          'pages/initialAppointment/initialMeetingPlace',
          expect.objectContaining({
            formAddress,
            manualAddressEntryUrl: '/licence/create/id/1/manual-address-entry',
            noAppointmentNeeded: true,
          }),
        )
      })
    })

    describe('POST', () => {
      it('should redirect to the contact page', async () => {
        await handler.POST(req, res)
        expect(addressService.addAppointmentAddress).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-contact')
      })
      it('should redirect to the licence contact number page when no appointment is needed', async () => {
        res.locals.licence.appointmentPersonType = 'NO_APPOINTMENT_NEEDED'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/licence-contact-number')
      })

      it('should redirect to the check your answers page if fromReview flag is set', async () => {
        req.query.fromReview = 'true'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
      })

      it('should redirect to /select-address with fromReview flag if searchQuery is provided', async () => {
        req = {
          params: {
            licenceId: 123,
          },
          body: {
            searchQuery: 'SW1A 1AA',
          },
          query: {
            fromReview: 'true',
          },
        } as unknown as Request

        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/123/select-address?searchQuery=SW1A%201AA&fromReview=true',
        )
        expect(addressService.addAppointmentAddress).not.toHaveBeenCalled()
      })

      it('should redirect to /select-address with out fromReview flag if searchQuery is provided', async () => {
        req = {
          params: {
            licenceId: 123,
          },
          body: {
            searchQuery: 'SW1A 1AA',
          },
          query: {},
        } as unknown as Request

        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/123/select-address?searchQuery=SW1A%201AA')
        expect(addressService.addAppointmentAddress).not.toHaveBeenCalled()
      })

      it('should add appointment address when preferredAddress is provided', async () => {
        const preferredAddress = {
          uprn: '123456',
          firstLine: '123 Test Street',
          secondLine: 'Apt 4',
          townOrCity: 'Testville',
          county: 'Testshire',
          postcode: 'TE5 7ST',
          source: 'test-source',
        }

        req = { ...req, body: { preferredAddress: JSON.stringify(preferredAddress) }, query: {} } as unknown as Request

        const mockAddAppointmentAddress = jest.fn()
        addressService.addAppointmentAddress = mockAddAppointmentAddress

        await handler.POST(req, res)

        expect(mockAddAppointmentAddress).toHaveBeenCalledWith(
          req.params.licenceId,
          {
            ...preferredAddress,
            isPreferredAddress: false,
          },
          res.locals.user,
        )

        expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/${req.params.licenceId}/initial-meeting-contact`)
      })
    })
  })

  describe('Prison user journey', () => {
    const handler = new InitialMeetingPlaceRoutes(licenceService, addressService, UserType.PRISON)

    describe('GET', () => {
      it('should render view', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingPlace', {
          formAddress,
          manualAddressEntryUrl: '/licence/create/id/1/manual-address-entry',
          preferredAddresses: [],
          noAppointmentNeeded: false,
        })
      })

      it('should render view with fromReviewParam', async () => {
        req.query.fromReview = 'true'
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/initialMeetingPlace', {
          formAddress,
          manualAddressEntryUrl: '/licence/create/id/1/manual-address-entry?fromReview=true',
          preferredAddresses: [],
          noAppointmentNeeded: false,
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the show page', async () => {
        await handler.POST(req, res)
        expect(addressService.addAppointmentAddress).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('/licence/view/id/1/show')
      })

      it('should not call addAppointmentAddress when only a search query is provided', async () => {
        req.body = { searchQuery: '123 Fake Street' }
        await handler.POST(req, res)
        expect(addressService.addAppointmentAddress).not.toHaveBeenCalled()
      })
    })
  })
})
