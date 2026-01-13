import { Request, Response } from 'express'
import { FoundComCase, ComSearchResponse } from '../../../@types/licenceApiClientTypes'
import ProbationSearchRoutes from './probationSearch'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceKind from '../../../enumeration/LicenceKind'

const searchService = new SearchService(null) as jest.Mocked<SearchService>
jest.mock('../../../services/searchService')

describe('Route Handlers - Search - Probation Search', () => {
  const handler = new ProbationSearchRoutes(searchService)
  const deliusStaffIdentifier = 3000
  let req: Request
  let res: Response

  let searchResponse = {
    results: [
      {
        name: 'Test Person',
        crn: 'A123456',
        nomisId: 'A1234BC',
        comName: 'Test Staff',
        comStaffCode: deliusStaffIdentifier.toString(),
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
      comStaffCode: deliusStaffIdentifier.toString(),
      teamName: 'Test Team',
      releaseDate: '2023-08-16',
      licenceId: 1,
      licenceType: 'AP',
      licenceStatus: 'IN_PROGRESS',
      isOnProbation: false,
    },
  ]
  const peopleOnProbation: FoundComCase[] = []

  let previousCaseloadPage = 'create'

  const tabParameters = {
    activeTab: '#people-in-prison',
    prisonTabCaption: 'In Prison Search Results',
    probationTabCaption: 'On Probation Search Results',
    prisonTabId: 'tab-heading-prison',
    probationTabId: 'tab-heading-probation',
  }

  beforeEach(() => {
    searchService.getComSearchResponses.mockResolvedValue(searchResponse as ComSearchResponse)

    req = {} as Request

    res = {
      locals: {
        user: {
          deliusStaffIdentifier,
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

      expect(searchService.getComSearchResponses).toHaveBeenCalledWith('Test', deliusStaffIdentifier)

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier,
        queryTerm: 'Test',
        peopleInPrison,
        peopleOnProbation: [],
        backLink: '/licence/create/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
        hasPriorityCases: false,
      })
    })

    it('calls the search service to search by CRN', async () => {
      req.query = { queryTerm: 'A123456', previousPage: 'create' }

      await handler.GET(req, res)

      expect(searchService.getComSearchResponses).toHaveBeenCalledWith('A123456', deliusStaffIdentifier)

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier,
        queryTerm: 'A123456',
        peopleInPrison,
        peopleOnProbation,
        backLink: '/licence/create/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
        hasPriorityCases: false,
      })
    })

    it('calls the search service to search by probation practitioner', async () => {
      req.query = { queryTerm: 'staff', previousPage: 'create' }

      await handler.GET(req, res)

      expect(searchService.getComSearchResponses).toHaveBeenCalledWith('staff', deliusStaffIdentifier)

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier,
        queryTerm: 'staff',
        peopleInPrison,
        peopleOnProbation,
        backLink: '/licence/create/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
        hasPriorityCases: false,
      })
    })

    it('trims white space from the query', async () => {
      const queryTerm = '   test   '
      const trimmedQueryTerm = queryTerm.trim()
      req.query = { queryTerm, previousPage: 'create' }

      await handler.GET(req, res)

      expect(searchService.getComSearchResponses).toHaveBeenCalledWith(queryTerm.trim(), deliusStaffIdentifier)

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier,
        queryTerm: trimmedQueryTerm,
        peopleInPrison,
        peopleOnProbation: [],
        backLink: '/licence/create/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
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

      expect(searchService.getComSearchResponses).not.toHaveBeenCalled()

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier,
        queryTerm: '',
        peopleInPrison: [],
        peopleOnProbation: [],
        backLink: '/licence/create/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
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

      expect(searchService.getComSearchResponses).not.toHaveBeenCalled()

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier,
        queryTerm: '',
        peopleInPrison: [],
        peopleOnProbation: [],
        backLink: '/licence/vary/caseload',
        tabParameters,
        statusConfig,
        previousCaseloadPage,
        hasPriorityCases: false,
      })
    })

    it('should sort by review needed and then release date descending of the probation tab', async () => {
      const peopleOnProbation: FoundComCase[] = [
        {
          name: 'Test Person1',
          crn: 'A123456',
          nomisId: 'A1234BC',
          comName: 'Test Staff',
          comStaffCode: deliusStaffIdentifier.toString(),
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: deliusStaffIdentifier.toString(),
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '13/09/2028',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.ACTIVE,
          releaseDateLabel: 'CRD',
          kind: LicenceKind.CRD,
          isOnProbation: true,
          isReviewNeeded: false,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        {
          name: 'Test Person2',
          crn: 'A123457',
          nomisId: 'A1234BD',
          comName: 'Test Staff',
          comStaffCode: deliusStaffIdentifier.toString(),
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: deliusStaffIdentifier.toString(),
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '25/05/2027',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.ACTIVE,
          releaseDateLabel: 'CRD',
          kind: LicenceKind.CRD,
          isOnProbation: true,
          isReviewNeeded: true,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        {
          name: 'Test Person3',
          crn: 'A123458',
          nomisId: 'A1234BE',
          comName: 'Test Staff',
          comStaffCode: deliusStaffIdentifier.toString(),
          probationPractitioner: {
            name: 'Test Staff',
            staffCode: deliusStaffIdentifier.toString(),
            allocated: true,
          },
          teamName: 'Test Team',
          releaseDate: '11/09/2032',
          licenceId: 1,
          licenceType: 'AP',
          licenceStatus: LicenceStatus.ACTIVE,
          releaseDateLabel: 'CRD',
          kind: LicenceKind.CRD,
          isOnProbation: true,
          isReviewNeeded: false,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
      ]

      const searchResponse = {
        results: peopleOnProbation,
        inPrisonCount: 0,
        onProbationCount: 1,
      }

      const expectedSortedResults = [peopleOnProbation[1], peopleOnProbation[2], peopleOnProbation[0]]
      searchService.getComSearchResponses.mockResolvedValue(searchResponse as ComSearchResponse)

      req.query = { queryTerm: 'Test', previousPage: 'vary' }
      previousCaseloadPage = 'vary'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/search/probationSearch/probationSearch', {
        deliusStaffIdentifier,
        queryTerm: 'Test',
        peopleInPrison: [],
        peopleOnProbation: expectedSortedResults,
        backLink: '/licence/vary/caseload',
        tabParameters: { ...tabParameters, activeTab: '#people-on-probation' },
        statusConfig,
        previousCaseloadPage,
        hasPriorityCases: true,
      })
    })
  })
})
