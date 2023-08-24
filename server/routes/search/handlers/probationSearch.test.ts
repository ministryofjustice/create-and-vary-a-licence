import { Request, Response } from 'express'
import { ProbationSearchResult } from '../../../@types/licenceApiClientTypes'
import ProbationSearchRoutes from './probationSearch'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'

const searchService = new SearchService(null) as jest.Mocked<SearchService>

jest.mock('../../../services/searchService')

describe('Route Handlers - Search - Probation Search', () => {
  const handler = new ProbationSearchRoutes(searchService)
  let req: Request
  let res: Response

  const searchResult = [
    {
      name: 'Test Person',
      crn: 'A123456',
      nomisId: 'A1234BC',
      comName: 'Test Staff',
      comStaffCode: '3000',
      teamName: 'Test Team',
      releaseDate: '2023-08-16',
      licenceId: 1,
      licenceType: 'AP',
      licenceStatus: 'IN_PROGRESS',
      isOnProbation: false,
    },
  ]

  beforeEach(() => {
    searchService.getProbationSearchResults.mockResolvedValue({
      results: searchResult,
      inPrisonCount: 1,
      onProbationCount: 0,
    } as ProbationSearchResult)

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

  describe('GET', () => {
    it('calls the search service with the neccessary parameters', async () => {
      req.query = { queryTerm: 'Test', previousPage: 'create' }

      await handler.GET(req, res)

      expect(searchService.getProbationSearchResults).toHaveBeenCalledWith('Test', 3000)

      expect(res.render).toBeCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier: 3000,
        queryTerm: 'Test',
        searchResults: searchResult,
        backLink: '/licence/create/caseload',
        inPrisonCountText: 'People in prison (1 result)',
        onProbationCountText: 'People on probation (0 results)',
        statusConfig,
      })
    })
  })
})
