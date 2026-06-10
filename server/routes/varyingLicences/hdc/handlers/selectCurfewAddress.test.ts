import { Request, Response } from 'express'
import SelectCurfewAddressRoutes from './selectCurfewAddress'
import AddressService from '../../../../services/addressService'
import { AddressSearchResponse } from '../../../../@types/licenceApiClientTypes'
import HdcCurfewAddressService from '../../../../services/hdc/hdcCurfewAddressService'
import CurfewAccommodationType from '../../../../enumeration/curfewAccommodationType'

jest.mock('../../../../services/addressService')
jest.mock('../../../../services/hdc/hdcCurfewAddressService')

const addressService = new AddressService(null) as jest.Mocked<AddressService>
const hdcCurfewAddressService = new HdcCurfewAddressService(null) as jest.Mocked<HdcCurfewAddressService>

describe('Route Handlers - Vary Licence - Select Curfew Address', () => {
  const handler = new SelectCurfewAddressRoutes(addressService, hdcCurfewAddressService)
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

  describe('POST', () => {
    it('should update curfew address and redirect to check your answers page', async () => {
      const selectedAddress = {
        uprn: '123456789',
        firstLine: '123 Fake Street',
        secondLine: 'Apt 4',
        townOrCity: 'Faketown',
        county: 'Fakecounty',
        postcode: 'FK1 2AB',
      }
      req.body.selectedCurfewAddress = JSON.stringify(selectedAddress)
      req.session.curfewAccommodationType = CurfewAccommodationType.RESIDENTIAL
      req.session.curfewAddressChecksCompleted = false
      req.session.curfewAddressChecksIncompleteReason = 'Reason for incomplete checks'

      await handler.POST(req, res)

      expect(hdcCurfewAddressService.updateHdcCurfewAddress).toHaveBeenCalledWith(
        parseInt(req.params.licenceId, 10),
        {
          address: {
            uprn: selectedAddress.uprn,
            firstLine: selectedAddress.firstLine,
            secondLine: selectedAddress.secondLine,
            townOrCity: selectedAddress.townOrCity,
            county: selectedAddress.county,
            postcode: selectedAddress.postcode,
            source: 'OS_PLACES',
          },
          accommodationType: req.session.curfewAccommodationType,
          postReleaseResidentialChecksCompleted: req.session.curfewAddressChecksCompleted,
          postReleaseResidentialChecksNotCompletedReason: req.session.curfewAddressChecksIncompleteReason,
        },
        res.locals.user,
      )

      expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/${req.params.licenceId}/check-your-answers`)
    })
  })
})
