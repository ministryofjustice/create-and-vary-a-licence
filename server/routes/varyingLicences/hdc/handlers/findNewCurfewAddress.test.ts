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

  describe('POST', () => {
    it('should redirect to select curfew address page with search query as a param', async () => {
      req.body.searchQuery = 'search query'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        `/licence/vary/id/${req.params.licenceId}/hdc/select-curfew-address?searchQuery=search%20query`,
      )
    })

    it('should not redirect to select curfew address page if search query is empty', async () => {
      req.body.searchQuery = '   '
      await handler.POST(req, res)
      expect(res.redirect).not.toHaveBeenCalledWith(
        `/licence/vary/id/${req.params.licenceId}/hdc/select-curfew-address?searchQuery=   `,
      )
    })
  })
})
