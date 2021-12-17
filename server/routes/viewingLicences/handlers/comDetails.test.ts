import { Request, Response } from 'express'

import ComDetailsRoutes from './comDetails'

describe('Route Handlers - COM Details', () => {
  const handler = new ComDetailsRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render com details view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/view/comDetails')
    })
  })
})
