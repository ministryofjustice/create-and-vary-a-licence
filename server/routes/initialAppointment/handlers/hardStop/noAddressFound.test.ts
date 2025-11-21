import { Request, Response } from 'express'
import PathType from '../../../../enumeration/pathType'
import NoAddressFoundRoutes from './noAddressFound'

describe('Route Handlers - Create a licence - No address found', () => {
  let req: Request
  let res: Response

  describe('Hardstop licence No address found for prison user journey', () => {
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
      it('should render the no address page found page in create flow', async () => {
        const handler = new NoAddressFoundRoutes(PathType.CREATE)

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/noAddressFound', {
          searchQuery: req.query.searchQuery,
          postcodeLookupSearchUrl: `/licence/hard-stop/create/id/${req.params.licenceId}/initial-meeting-place`,
          manualAddressEntryUrl: `/licence/hard-stop/create/id/${req.params.licenceId}/manual-address-entry`,
        })
      })

      it('should render the no address page found page in edit flow', async () => {
        const handler = new NoAddressFoundRoutes(PathType.EDIT)

        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/noAddressFound', {
          searchQuery: req.query.searchQuery,
          postcodeLookupSearchUrl: `/licence/hard-stop/edit/id/${req.params.licenceId}/initial-meeting-place`,
          manualAddressEntryUrl: `/licence/hard-stop/edit/id/${req.params.licenceId}/manual-address-entry`,
        })
      })
    })
  })
})
