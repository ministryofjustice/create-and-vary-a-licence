import { Request, Response } from 'express'
import ResidentialChecksIncompleteReasonRoutes from './residentialChecksIncompleteReason'

describe('Route Handlers - Vary Licence - Vlo discussion', () => {
  const handler = new ResidentialChecksIncompleteReasonRoutes()
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
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/residentialChecksIncompleteReason')
    })
  })

  describe('POST', () => {
    it('should store the incomplete reason and redirect to the find address page', async () => {
      req.body = { reason: 'Reason' }
      req.session.curfewAddressChecksIncompleteReason = 'Outdated reason'
      await handler.POST(req, res)

      expect(req.session.curfewAddressChecksIncompleteReason).toEqual('Reason')
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/find-address')
    })
  })
})
