import { Request, Response } from 'express'
import CurfewAddressRoutes from './curfewAddress'

describe('Route Handlers - Vary Licence - Curfew Address', () => {
  const handler = new CurfewAddressRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      body: {},
      query: {},
      session: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/curfewAddress')
    })
  })
})
