/* eslint-disable  @typescript-eslint/no-explicit-any */
import InitialMeetingContactRoutes from './initialMeetingContact'

describe('Route Handlers - Create Licence - Initial Meeting Contact', () => {
  const handler = new InitialMeetingContactRoutes()
  let req: any
  let res: any

  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
    }

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    }
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingContact', {})
    })
  })

  describe('POST', () => {
    it('should redirect to the expected page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-time')
    })
  })
})
