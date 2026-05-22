import { Request, Response } from 'express'
import ResidentialChecksCompletedQuestionRoutes from './residentialChecksCompletedQuestion'

describe('Route Handlers - Vary Licence - Vlo discussion', () => {
  const handler = new ResidentialChecksCompletedQuestionRoutes()
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
      expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/residentialChecksCompletedQuestion')
    })
  })

  describe('POST', () => {
    it('should clear incomplete reason and redirect to the find address page if the address checks are complete', async () => {
      req.body = { answer: 'Yes' }
      req.session.curfewAddressChecksIncompleteReason = 'outdated reason'
      await handler.POST(req, res)

      expect(req.session.curfewAddressChecksIncompleteReason).toBeNull()
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/find-address')
    })

    it('should redirect to the find address page if the address checks are not complete', async () => {
      req.body = { answer: 'No' }
      await handler.POST(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/residential-checks-incomplete')
    })
  })
})
