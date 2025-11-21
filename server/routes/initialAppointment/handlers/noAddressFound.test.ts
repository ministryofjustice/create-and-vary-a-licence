import { Request, Response } from 'express'
import NoAddressFoundRoutes from './noAddressFound'
import UserType from '../../../enumeration/userType'

describe('Route Handlers - Create a licence - No address found', () => {
  let req: Request
  let res: Response
  const handler = new NoAddressFoundRoutes(UserType.PROBATION)

  describe('No address found for probation user journey', () => {
    beforeEach(() => {
      req = {
        params: {
          licenceId: 1,
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
        },
      } as unknown as Response
    })
    describe('GET', () => {
      it('should render the no address page found page in create flow', async () => {
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/noAddressFound', {
          searchQuery: req.query.searchQuery,
          postcodeLookupSearchUrl: `/licence/create/id/${req.params.licenceId}/initial-meeting-place`,
          manualAddressEntryUrl: `/licence/create/id/${req.params.licenceId}/manual-address-entry`,
        })
      })

      it('should render the no address page found page in edit flow', async () => {
        req.query.fromReview = 'true'
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/noAddressFound', {
          searchQuery: req.query.searchQuery,
          postcodeLookupSearchUrl: `/licence/create/id/${req.params.licenceId}/initial-meeting-place?fromReview=true`,
          manualAddressEntryUrl: `/licence/create/id/${req.params.licenceId}/manual-address-entry?fromReview=true`,
        })
      })
    })
  })
})
