import { Request, Response } from 'express'
import WhatsNewPage from './whatsNewPage'

describe('Whats new page', () => {
  const handler = new WhatsNewPage()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      query: {},
      session: { returnToCase: '/licence/create/caseload' },
    } as unknown as Request

    res = {
      header: jest.fn(),
      send: jest.fn(),
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render cases when user only has 1 caseloaded prison', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/whatsNew', {
        backLink: req.session.returnToCase,
      })
    })
  })
})
