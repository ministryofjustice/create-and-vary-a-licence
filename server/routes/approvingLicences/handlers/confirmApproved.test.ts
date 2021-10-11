import { Request, Response } from 'express'

import ConfirmApprovedRoutes from './confirmApproved'

describe('Route - approve licence', () => {
  const handler = new ConfirmApprovedRoutes()
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
    it('should render confirmation page', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/approved')
    })
  })
})
