import { NextFunction, Request, Response } from 'express'
import DprService from '../../../services/dprService'
import DprReportsRoutes from './dprReports'

const dprService = new DprService(null) as jest.Mocked<DprService>
jest.mock('../../../services/dprService')

describe('Route Handlers - DPR Reports', () => {
  const handler = new DprReportsRoutes(dprService)
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('Should render the correct view', async () => {
      await handler.GET(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/dpr/reports', {})
    })
  })
})
