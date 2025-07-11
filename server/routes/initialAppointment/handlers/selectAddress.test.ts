import { Request, Response } from 'express'
import AddressService from '../../../services/addressService'
import UserType from '../../../enumeration/userType'
import SelectAddressRoutes from './selectAddress'
import { AddressSearchResponse } from '../../../@types/licenceApiClientTypes'
import { LicenceApiClient } from '../../../data'

const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
const addressService = new AddressService(licenceApiClient) as jest.Mocked<AddressService>

describe('Route Handlers - Create Licence - Initial Meeting Place', () => {
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
        licence: {
          appointmentAddress: 'Manchester Probation Service, Unit 4, Smith Street, Stockport, SP1 3DN',
          conditionalReleaseDate: '14/05/2022',
          isEligibleForEarlyRelease: true,
        },
      },
    } as unknown as Response

    addressService.searchForAddresses = jest.fn()
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
        expect(res.render).toHaveBeenCalledWith('pages/create/selectAddress', {
          addresses: mockResponse,
          licenceId: req.params.licenceId,
          searchQuery: '123 Fake Street',
          postcodeLookupSearchUrl: `/licence/create/id/${req.params.licenceId}/initial-meeting-place`,
        })
      })
    })
  })
})
