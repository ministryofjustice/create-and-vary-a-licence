import { Request, Response } from 'express'
import DprReportsRoutes from './dprReports'
import DprService from '../../../services/dprService'

const dprService = new DprService(null) as jest.Mocked<DprService>
jest.mock('../../../services/dprService')

describe('Route Handlers - DPR Reports', () => {
  const handler = new DprReportsRoutes(dprService)
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('Should render the correct view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/support/reports', {})
    })
  })
})
