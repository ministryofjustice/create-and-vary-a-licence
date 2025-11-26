import { Request, Response } from 'express'
import PathType from '../../../../../enumeration/pathType'
import SelectAddressRoutes from './selectAddress'
import AddressService from '../../../../../services/addressService'

const addressService = new AddressService(null) as jest.Mocked<AddressService>

describe('Route Handlers - Create a licence - Select an address', () => {
  let req: Request
  let res: Response

  describe('Hardstop licence select address for prison user journey', () => {
    beforeEach(() => {
      req = {
        params: {
          licenceId: 123,
        },
        body: {},
        query: {
          searchQuery: '12345',
        },
      } as unknown as Request

      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: {
            username: 'joebloggs',
          },
          licence: {
            id: req.params.licenceId,
            responsibleComFullName: 'Simon Webster',
          },
        },
      } as unknown as Response

      addressService.searchForAddresses = jest.fn()
      addressService.addAppointmentAddress = jest.fn()
    })

    describe('GET /select-address', () => {
      const searchQuery = 'SW1A 1AA'

      beforeEach(() => {
        req.query.searchQuery = searchQuery
      })

      it('should redirect to no-address-found if no addresses are returned', async () => {
        addressService.searchForAddresses = jest.fn().mockResolvedValue([])
        const handler = new SelectAddressRoutes(addressService, PathType.CREATE)

        await handler.GET(req, res)

        expect(addressService.searchForAddresses).toHaveBeenCalledWith(searchQuery, res.locals.user, 'probation')
        expect(res.redirect).toHaveBeenCalledWith(
          `/licence/time-served/create/id/${req.params.licenceId}/no-address-found?searchQuery=SW1A%201AA`,
        )
      })

      it('should render selectAddress page with addresses in create flow', async () => {
        const mockAddresses = [{ line1: '10 Downing Street' }]
        const handler = new SelectAddressRoutes(addressService, PathType.CREATE)
        addressService.searchForAddresses = jest.fn().mockResolvedValue(mockAddresses)

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/selectAddress', {
          addresses: mockAddresses,
          licenceId: req.params.licenceId,
          searchQuery,
          continueOrSaveLabel: 'Continue',
          postcodeLookupSearchUrl: `/licence/time-served/create/id/${req.params.licenceId}/initial-meeting-place`,
          manualAddressEntryUrl: `/licence/time-served/create/id/${req.params.licenceId}/manual-address-entry`,
        })
      })

      it('should render selectAddress page with addresses in edit flow', async () => {
        const mockAddresses = [{ line1: '10 Downing Street' }]
        const handler = new SelectAddressRoutes(addressService, PathType.EDIT)
        addressService.searchForAddresses = jest.fn().mockResolvedValue(mockAddresses)

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/selectAddress', {
          addresses: mockAddresses,
          licenceId: req.params.licenceId,
          searchQuery,
          continueOrSaveLabel: 'Save',
          postcodeLookupSearchUrl: `/licence/time-served/edit/id/${req.params.licenceId}/initial-meeting-place`,
          manualAddressEntryUrl: `/licence/time-served/edit/id/${req.params.licenceId}/manual-address-entry`,
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
        const handler = new SelectAddressRoutes(addressService, PathType.CREATE)
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

        expect(res.redirect).toHaveBeenCalledWith(
          `/licence/time-served/create/id/${req.params.licenceId}/initial-meeting-contact`,
        )
      })

      it('should parse selectedAddress and call addAppointmentAddress in edit flow', async () => {
        const handler = new SelectAddressRoutes(addressService, PathType.EDIT)
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

        expect(res.redirect).toHaveBeenCalledWith(`/licence/time-served/edit/id/123/contact-probation-team`)
      })
    })
  })
})
