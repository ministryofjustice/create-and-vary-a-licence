import { Request, Response } from 'express'
import { FoundProbationRecord, ProbationSearchResult } from '../../../@types/licenceApiClientTypes'
import ProbationSearchRoutes from './probationSearch'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'
import config from '../../../config'

const searchService = new SearchService(null) as jest.Mocked<SearchService>
jest.mock('../../../services/searchService')

describe('Route Handlers - Search - Probation Search', () => {
  const handler = new ProbationSearchRoutes(searchService)
  let req: Request
  let res: Response

  let searchResponse = {
    results: [
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
    ],
    inPrisonCount: 1,
    onProbationCount: 0,
  }

  const peopleInPrison = [
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
  const peopleOnProbation: FoundProbationRecord[] = []

  let previousCaseloadPage = 'create'

  const tabParameters = {
    activeTab: '#people-in-prison',
    prisonTabCaption: 'In Prison Search Results',
    probationTabCaption: 'On Probation Search Results',
    prisonTabId: 'tab-heading-prison',
    probationTabId: 'tab-heading-probation',
  }

  beforeEach(() => {
    searchService.getProbationSearchResults.mockResolvedValue(searchResponse as ProbationSearchResult)

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
    it('calls the search service to search by name', async () => {
      req.query = { queryTerm: 'Test', previousPage: 'create' }

      await handler.GET(req, res)

      expect(searchService.getProbationSearchResults).toHaveBeenCalledWith('Test', 3000)

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier: 3000,
        queryTerm: 'Test',
        peopleInPrison,
        peopleOnProbation: [],
        backLink: '/licence/create/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
        recallsEnabled: config.recallsEnabled,
        hasPriorityCases: false,
      })
    })

    it('calls the search service to search by CRN', async () => {
      req.query = { queryTerm: 'A123456', previousPage: 'create' }

      await handler.GET(req, res)

      expect(searchService.getProbationSearchResults).toHaveBeenCalledWith('A123456', 3000)

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier: 3000,
        queryTerm: 'A123456',
        peopleInPrison,
        peopleOnProbation,
        backLink: '/licence/create/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
        recallsEnabled: config.recallsEnabled,
        hasPriorityCases: false,
      })
    })

    it('calls the search service to search by probation practioner', async () => {
      req.query = { queryTerm: 'staff', previousPage: 'create' }

      await handler.GET(req, res)

      expect(searchService.getProbationSearchResults).toHaveBeenCalledWith('staff', 3000)

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier: 3000,
        queryTerm: 'staff',
        peopleInPrison,
        peopleOnProbation,
        backLink: '/licence/create/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
        recallsEnabled: config.recallsEnabled,
        hasPriorityCases: false,
      })
    })

    it('does not call the search service for a blank query', async () => {
      req.query = { queryTerm: '', previousPage: 'create' }

      searchResponse = {
        results: [],
        inPrisonCount: 0,
        onProbationCount: 0,
      }

      await handler.GET(req, res)

      expect(searchService.getProbationSearchResults).not.toHaveBeenCalled()

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier: 3000,
        queryTerm: '',
        peopleInPrison: [],
        peopleOnProbation: [],
        backLink: '/licence/create/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
        recallsEnabled: config.recallsEnabled,
        hasPriorityCases: false,
      })
    })

    it('sets the correct back link dependent on the previous page visited', async () => {
      req.query = { queryTerm: '', previousPage: 'vary' }
      previousCaseloadPage = 'vary'

      searchResponse = {
        results: [],
        inPrisonCount: 0,
        onProbationCount: 0,
      }

      await handler.GET(req, res)

      expect(searchService.getProbationSearchResults).not.toHaveBeenCalled()

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier: 3000,
        queryTerm: '',
        peopleInPrison: [],
        peopleOnProbation: [],
        backLink: '/licence/vary/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
        recallsEnabled: config.recallsEnabled,
        hasPriorityCases: false,
      })
    })
  })
})
