import { Request, Response } from 'express'
import AddressService from '../../../services/addressService'
import ManualAddressPostcodeLookupRoutes from './manualAddressPostcodeLookup'
import UserType from '../../../enumeration/userType'

const addressService = new AddressService(null) as jest.Mocked<AddressService>

describe('Route Handlers - Create a licence - Manual address entry', () => {
  let req: Request
  let res: Response
  const handler = new ManualAddressPostcodeLookupRoutes(addressService, UserType.PROBATION)

  describe('Hardstop licence prison user journey', () => {
    beforeEach(() => {
      req = {
        params: {
          licenceId: 1,
        },
        body: {},
        query: {},
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
    })
    describe('GET', () => {
      it('should render the manual address postcode lookup form in create flow', async () => {
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/create/manualAddressPostcodeLookupForm', {
          postcodeLookupUrl: `/licence/create/id/${req.params.licenceId}/initial-meeting-place`,
        })
      })

      it('should render the manual address postcode lookup form in edit flow', async () => {
        req.query.fromReview = 'true'
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/create/manualAddressPostcodeLookupForm', {
          postcodeLookupUrl: `/licence/create/id/${req.params.licenceId}/initial-meeting-place?fromReview=true`,
        })
      })
    })

    describe('POST /manual-address', () => {
      const licenceId = '123'
      const user = { username: 'joebloggs' }

      beforeEach(() => {
        req.params.licenceId = licenceId
        req.body = {
          firstLine: '123 Test Street',
          secondLine: 'Flat 4B',
          townOrCity: 'Testville',
          county: 'Testshire',
          postcode: 'TE5 7ST',
          isPreferredAddress: '',
        }

        addressService.addAppointmentAddress = jest.fn()
      })

      it('should call addAppointmentAddress with correct data and redirect to initial meeting contact in create flow', async () => {
        await handler.POST(req, res)

        expect(addressService.addAppointmentAddress).toHaveBeenCalledWith(
          licenceId,
          {
            ...req.body,
            isPreferredAddress: false,
            source: 'MANUAL',
          },
          user,
        )
        expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/${licenceId}/initial-meeting-contact`)
      })

      it('should call addAppointmentAddress and redirect to check-your-answers in edit flow', async () => {
        req.query.fromReview = 'true'
        await handler.POST(req, res)

        expect(addressService.addAppointmentAddress).toHaveBeenCalledWith(
          licenceId,
          {
            ...req.body,
            isPreferredAddress: false,
            source: 'MANUAL',
          },
          user,
        )
        expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/${licenceId}/check-your-answers`)
      })

      it('should redirect to show route for prison view', async () => {
        const handler = new ManualAddressPostcodeLookupRoutes(addressService, UserType.PRISON)
        req.body.isPreferredAddress = 'true'
        await handler.POST(req, res)

        expect(addressService.addAppointmentAddress).toHaveBeenCalledWith(
          licenceId,
          {
            ...req.body,
            isPreferredAddress: true,
            source: 'MANUAL',
          },
          user,
        )
        expect(res.redirect).toHaveBeenCalledWith(`/licence/view/id/${licenceId}/show`)
      })
    })
  })
})
