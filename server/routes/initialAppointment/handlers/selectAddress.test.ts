import { Request, Response } from 'express'
import AddressService from '../../../services/addressService'
import UserType from '../../../enumeration/userType'
import SelectAddressRoutes from './selectAddress'
import { AddressSearchResponse } from '../../../@types/licenceApiClientTypes'
import { LicenceApiClient } from '../../../data'

const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
const addressService = new AddressService(licenceApiClient) as jest.Mocked<AddressService>

describe('Route Handlers - Create Licence - Select an address', () => {
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      body: {},
      query: { searchQuery: '123 Fake Street' },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response

    addressService.searchForAddresses = jest.fn()
    addressService.addAppointmentAddress = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Select Address user journey', () => {
    const handler = new SelectAddressRoutes(addressService, UserType.PROBATION)

    describe('GET', () => {
      it('should redirect to no address found if no addresses are returned', async () => {
        addressService.searchForAddresses.mockResolvedValue([])
        await handler.GET(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          `/licence/create/id/${req.params.licenceId}/no-address-found?searchQuery=123%20Fake%20Street`,
        )
      })

      it('should render addresses if found', async () => {
        const mockResponse = [{ firstLine: '123 Fake Street' }] as AddressSearchResponse[]
        addressService.searchForAddresses.mockResolvedValue(mockResponse)
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/selectAddress', {
          addresses: mockResponse,
          licenceId: req.params.licenceId,
          searchQuery: '123 Fake Street',
          postcodeLookupSearchUrl: `/licence/create/id/${req.params.licenceId}/initial-meeting-place`,
          manualAddressEntryUrl: `/licence/create/id/${req.params.licenceId}/manual-address-entry`,
        })
      })
    })

    describe('POST /select-address', () => {
      const selectedAddress = {
        uprn: '100012345678',
        firstLine: '10 Downing Street',
        secondLine: '',
        townOrCity: 'London',
        county: '',
        postcode: 'SW1A 2AA',
        isPreferredAddress: '',
      }

      beforeEach(() => {
        req.body.selectedAddress = JSON.stringify(selectedAddress)
      })

      it('should parse selectedAddress and call addAppointmentAddress in create flow', async () => {
        await handler.POST(req, res)

        expect(addressService.addAppointmentAddress).toHaveBeenCalledWith(
          req.params.licenceId,
          {
            ...selectedAddress,
            isPreferredAddress: false,
            source: 'OS_PLACES',
          },
          res.locals.user,
        )

        expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/${req.params.licenceId}/initial-meeting-contact`)
      })

      it('should parse selectedAddress and call addAppointmentAddress in edit flow', async () => {
        req.query.fromReview = 'true'
        req.body.isPreferredAddress = 'true'
        await handler.POST(req, res)

        expect(addressService.addAppointmentAddress).toHaveBeenCalledWith(
          req.params.licenceId,
          {
            ...selectedAddress,
            isPreferredAddress: true,
            source: 'OS_PLACES',
          },
          res.locals.user,
        )

        expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/${req.params.licenceId}/check-your-answers`)
      })
    })
  })
})
