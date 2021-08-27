import { Request, Response } from 'express'

import InitialMeetingContactRoutes from './initialMeetingContact'

describe('Route Handlers - Create Licence - Initial Meeting Contact', () => {
  const handler = new InitialMeetingContactRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingContact', {})
    })
  })

  describe('POST', () => {
    it('should redirect to the meeting time page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-time')
    })
  })
})
