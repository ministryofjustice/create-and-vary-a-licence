import { Request, Response } from 'express'

import VaryReferConfirmRoutes from './varyReferConfirm'

describe('Route - variation referral confirmation', () => {
  const handler = new VaryReferConfirmRoutes()
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
    it('should render variation referral confirmation page', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary-approve/variation-referred')
    })
  })
})
