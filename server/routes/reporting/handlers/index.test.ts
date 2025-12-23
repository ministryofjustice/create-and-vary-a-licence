import { Request, Response } from 'express'
import DprHomeRoutes from '.'

describe('Route Handlers - DPR Reports', () => {
  const handler = new DprHomeRoutes()
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
      expect(res.render).toHaveBeenCalledWith('pages/reports/index', {})
    })
  })
})
