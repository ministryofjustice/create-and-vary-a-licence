/* eslint-disable  @typescript-eslint/no-explicit-any */

import HomeRoutes from './home'

describe('Route Handlers - Home', () => {
  const handler = new HomeRoutes()
  let req: any
  let res: any

  beforeEach(() => {
    req = {
      params: 'id',
    }

    res = {
      render: jest.fn(),
    }
  })

  describe('GET', () => {
    it('', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index')
    })
  })
})
