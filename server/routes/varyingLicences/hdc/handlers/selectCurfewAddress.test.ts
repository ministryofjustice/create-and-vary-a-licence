import { Request, Response } from 'express'
import SelectCurfewAddressRoutes from './selectCurfewAddress'
import AddressService from '../../../../services/addressService'
import { AddressSearchResponse } from '../../../../@types/licenceApiClientTypes'

jest.mock('../../../../services/addressService')

const addressService = new AddressService(null) as jest.Mocked<AddressService>

describe('Route Handlers - Vary Licence - Select Curfew Address', () => {
  const handler = new SelectCurfewAddressRoutes(addressService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      body: {},
      query: {},
      session: {},
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

  describe('GET', () => {
    it('should render view', async () => {
      const mockResponse = [{ firstLine: '123 Fake Street' }] as AddressSearchResponse[]
      addressService.searchForAddresses.mockResolvedValue(mockResponse)
      req.query.searchQuery = mockResponse[0].firstLine

      await handler.GET(req, res)
      expect(addressService.searchForAddresses).toHaveBeenCalledWith(
        req.query.searchQuery,
        res.locals.user,
        'probation',
      )
      expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/selectCurfewAddress', {
        addresses: mockResponse,
        licenceId: req.params.licenceId,
        searchQuery: req.query.searchQuery,
        postcodeLookupSearchUrl: `/licence/vary/id/${req.params.licenceId}/hdc/find-the-new-curfew-address`,
        manualAddressEntryUrl: `/licence/vary/id/${req.params.licenceId}/hdc/manual-curfew-address-entry`,
      })
    })

    it('should redirect to no curfew address found page if no addresses are found', async () => {
      addressService.searchForAddresses.mockResolvedValue([])
      req.query.searchQuery = '123 Fake Street'

      await handler.GET(req, res)
      expect(addressService.searchForAddresses).toHaveBeenCalledWith(
        req.query.searchQuery,
        res.locals.user,
        'probation',
      )
      expect(res.redirect).toHaveBeenCalledWith(
        `/licence/vary/id/${req.params.licenceId}/hdc/no-curfew-address-found?searchQuery=123%20Fake%20Street`,
      )
    })
  })
})
