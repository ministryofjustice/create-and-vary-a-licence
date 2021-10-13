import { Request, Response } from 'express'

import ConfirmRejectedRoutes from './confirmRejected'

describe('Route - reject licence', () => {
  const handler = new ConfirmRejectedRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render rejected page', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/rejected')
    })
  })
})
