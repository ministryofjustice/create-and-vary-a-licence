import { Request, Response } from 'express'
import FindNewCurfewAddressRoutes from './findNewCurfewAddress'

describe('Route Handlers - Vary Licence - Find New Curfew Address', () => {
  const handler = new FindNewCurfewAddressRoutes()
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
      expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/findNewCurfewAddress', {
        manualAddressEntryUrl: `/licence/vary/id/${req.params.licenceId}/hdc/manual-curfew-address-entry`,
      })
    })
  })
})
