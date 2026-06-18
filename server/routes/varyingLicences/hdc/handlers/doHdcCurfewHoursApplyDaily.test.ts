import { Request, Response } from 'express'
import DoHdcCurfewHoursApplyDailyRoutes from './doHdcCurfewHoursApplyDaily'

describe('Route Handlers - Vary Licence - Do HDC Curfew Hours Apply Daily', () => {
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {},
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
        licence: {
          id: 1,
        },
      },
    } as unknown as Response
  })

  const handler = new DoHdcCurfewHoursApplyDailyRoutes()

  describe('GET', () => {
    it('should render view', async () => {
      req.query = { edit: 'telNumber' }
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/hdc/doHdcCurfewHoursApplyDaily')
    })
  })

  describe('POST', () => {
    it('should redirect to the individual curfew hours page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/individual-curfew-hours')
    })

    it('should redirect to the curfew hours page', async () => {
      req.body = { answer: 'Yes' }
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/curfew-hours')
    })

    it('should redirect to the curfew hours page with fromReview query param', async () => {
      req.body = { answer: 'Yes' }
      req.query = { fromReview: 'true' }
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/curfew-hours?fromReview=true')
    })
  })
})
