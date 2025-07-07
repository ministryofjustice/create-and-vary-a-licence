import { Request, Response } from 'express'
import SupportHomeRoutes from './supportHome'
import config from '../../../config'

describe('Route Handlers - Home', () => {
  const existingConfig = config
  const handler = new SupportHomeRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    existingConfig.dprReportingEnabled = true
    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('Should render the correct view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/home', { dprReportingEnabled: true })
    })
  })
})
