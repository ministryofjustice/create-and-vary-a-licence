import { Request, Response } from 'express'
import WhatsNewPage from './whatsNewController'

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
    it('should render whats new page', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/whatsNewPage', {
        backLink: req.session.returnToCase,
      })
    })
  })
})
