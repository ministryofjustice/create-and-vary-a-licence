import { Request, Response } from 'express'
import NoAddressFoundRoutes from './noAddressFound'

describe('Route Handlers - Vary a licence - HDC No address found', () => {
  let req: Request
  let res: Response
  const handler = new NoAddressFoundRoutes()

  describe('No address found for probation vary journey', () => {
    beforeEach(() => {
      req = {
        params: {
          licenceId: 1,
        },
        body: {},
        query: {
          searchQuery: '12345',
        },
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
      it('should render the no address page found page in vary flow', async () => {
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/noAddressFound', {
          searchQuery: req.query.searchQuery,
          curfewAddressSearchUrl: `/licence/vary/id/${req.params.licenceId}/hdc/curfew-address`,
          manualAddressEntryUrl: `/licence/vary/id/${req.params.licenceId}/hdc/manual-curfew-address-entry`,
        })
      })
    })
  })
})
