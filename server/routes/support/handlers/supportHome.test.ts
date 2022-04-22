import { Request, Response } from 'express'
import SupportHomeRoutes from './supportHome'

describe('Route Handlers - Home', () => {
  const handler = new SupportHomeRoutes()
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
      expect(res.render).toHaveBeenCalledWith('pages/support/home')
    })
  })
})
