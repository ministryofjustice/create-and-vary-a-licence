import { Request, Response } from 'express'
import CaSearchRoutes from './caSearch'
import SearchService from '../../../services/searchService'

const searchService = new SearchService(null) as jest.Mocked<SearchService>

jest.mock('../../../services/searchService')

describe('Route Handlers - Search - Ca Search', () => {
  const handler = new CaSearchRoutes(searchService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {} as Request

    res = {
      locals: {
        user: {
          deliusStaffIdentifier: 3000,
        },
      },
      render: jest.fn(),
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () =>
    it('sets the correct back link dependent on the previous page visited', async () => {
      req.query = { queryTerm: '' }

      await handler.GET(req, res)

      expect(searchService.getProbationSearchResults).not.toHaveBeenCalled()

      expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
        queryTerm: '',
        backLink: '/licence/view/cases',
      })
    }))
})
