import { Request, Response } from 'express'

import VaryApproveConfirmRoutes from './varyApproveConfirm'

describe('Route - variation approval confirmation', () => {
  const handler = new VaryApproveConfirmRoutes()
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
    it('should render variation approval confirmation page', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary-approve/approved')
    })
  })
})
