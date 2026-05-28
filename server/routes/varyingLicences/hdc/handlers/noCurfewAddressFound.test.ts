import { Request, Response } from 'express'
import NoAddressFoundRoutes from './noCurfewAddressFound'

describe('Route Handlers - Vary a licence - No curfew address found', () => {
  let req: Request
  let res: Response
  const handler = new NoAddressFoundRoutes()

  describe('No curfew address found for probation vary journey', () => {
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
      it('should render the no curfew address page found page in vary flow', async () => {
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/noCurfewAddressFound', {
          searchQuery: req.query.searchQuery,
          curfewAddressSearchUrl: `/licence/vary/id/${req.params.licenceId}/hdc/find-the-new-curfew-address`,
          manualAddressEntryUrl: `/licence/vary/id/${req.params.licenceId}/hdc/manual-curfew-address-entry`,
        })
      })
    })
  })
})
