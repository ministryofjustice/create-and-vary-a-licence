import { Request, Response } from 'express'

import ConfirmationRoutes from './confirmation'

describe('Route Handlers - Create Licence - Confirmation', () => {
  const handler = new ConfirmationRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
        offender: {
          name: 'Adam Balasaravika',
          prison: 'Brixton Prison',
        },
      })
    })
  })
})
