import { Request, Response } from 'express'
import CaSearchRoutes from './caSearch'
import SearchService from '../../../services/searchService'
import PrisonerService from '../../../services/prisonerService'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { CaCase } from '../../../@types/licenceApiClientTypes'
import statusConfig from '../../../licences/licenceStatus'
import config from '../../../config'

const searchService = new SearchService(null) as jest.Mocked<SearchService>
jest.mock('../../../services/searchService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

describe('Route Handlers - Search - Ca Search', () => {
  const handler = new CaSearchRoutes(searchService, prisonerService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      query: {
        queryTerm: '',
      },
      session: { caseloadsSelected: [] },
    } as unknown as Request

    res = {
      header: jest.fn(),
      send: jest.fn(),
      render: jest.fn(),
      locals: {
        user: {
          username: 'test1',
          activeCaseload: 'BAI',
          prisonCaseload: ['BAI'],
        },
      },
    } as unknown as Response

    prisonerService.getPrisons.mockResolvedValue([
      {
        agencyId: 'BAI',
        description: 'Belmarsh (HMP)',
      },
      {
        agencyId: 'BXI',
        description: 'Brixton (HMP)',
      },
      {
        agencyId: 'MDI',
        description: 'Moorland (HMP)',
      },
      {
        agencyId: 'BMI',
        description: 'Birmingham (HMP)',
      },
    ] as PrisonDetail[])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  let searchResponse = {
    inPrisonResults: [
      {
        kind: LicenceKind.CRD,
        licenceId: 1,
        name: 'Test Person 1',
        prisonerNumber: 'A1234AA',
        probationPractitioner: {
          name: 'Test Com 1',
        },
        releaseDate: '01/07/2025',
        releaseDateLabel: 'Confirmed release date',
        licenceStatus: LicenceStatus.APPROVED,
        tabType: 'FUTURE_RELEASES',
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Test Updater',
        isDueForEarlyRelease: false,
        isInHardStopPeriod: true,
        prisonCode: 'BAI',
        prisonDescription: 'Moorland (HMP)',
      },
      {
        kind: LicenceKind.CRD,
        licenceId: 2,
        name: 'Test Person 2',
        prisonerNumber: 'A1234AB',
        probationPractitioner: {
          name: 'Test Com 2',
        },
        releaseDate: '01/08/2025',
        releaseDateLabel: 'Confirmed release date',
        licenceStatus: LicenceStatus.IN_PROGRESS,
        tabType: 'FUTURE_RELEASES',
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Test Updater',
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        prisonCode: 'BAI',
        prisonDescription: 'Moorland (HMP)',
      },
      {
        kind: LicenceKind.CRD,
        licenceId: 3,
        name: 'Test Person 3',
        prisonerNumber: 'A1234AC',
        probationPractitioner: {
          name: 'Test Com 3',
        },
        releaseDate: '01/09/2025',
        releaseDateLabel: 'Confirmed release date',
        licenceStatus: LicenceStatus.SUBMITTED,
        tabType: 'FUTURE_RELEASES',
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Test Updater',
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        prisonCode: 'BAI',
        prisonDescription: 'Moorland (HMP)',
      },
    ] as CaCase[],
    onProbationResults: [
      {
        kind: LicenceKind.CRD,
        licenceId: 5,
        name: 'Test Person 5',
        prisonerNumber: 'A1234AE',
        probationPractitioner: {
          name: 'Test Com 5',
        },
        releaseDate: '01/03/2025',
        releaseDateLabel: 'Confirmed release date',
        licenceStatus: LicenceStatus.ACTIVE,
        tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Test Updater',
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        prisonCode: 'BAI',
        prisonDescription: 'Moorland (HMP)',
      },
      {
        kind: LicenceKind.CRD,
        licenceId: 6,
        name: 'Test Person 6',
        prisonerNumber: 'A1234AF',
        probationPractitioner: {
          name: 'Test Com 6',
        },
        releaseDate: '01/04/2025',
        releaseDateLabel: 'Confirmed release date',
        licenceStatus: LicenceStatus.TIMED_OUT,
        tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Test Updater',
        isDueForEarlyRelease: false,
        isInHardStopPeriod: true,
        prisonCode: 'BAI',
        prisonDescription: 'Moorland (HMP)',
      },
      {
        kind: LicenceKind.CRD,
        licenceId: 7,
        name: 'Test Person 7',
        prisonerNumber: 'A1234AG',
        probationPractitioner: {
          name: 'Test Com 7',
        },
        releaseDate: '01/05/2025',
        releaseDateLabel: 'Confirmed release date',
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
        tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Test Updater',
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        prisonCode: 'BAI',
        prisonDescription: 'Moorland (HMP)',
      },
      {
        kind: LicenceKind.HARD_STOP,
        licenceId: 8,
        name: 'Test Person 8',
        prisonerNumber: 'A1234AH',
        probationPractitioner: {
          name: 'Test Com 8',
        },
        releaseDate: '01/06/2025',
        releaseDateLabel: 'Confirmed release date',
        licenceStatus: LicenceStatus.IN_PROGRESS,
        tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Test Updater',
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        prisonCode: 'BAI',
        prisonDescription: 'Moorland (HMP)',
      },
    ] as CaCase[],
  }

  it('should render cases when user has a caseload in a single prison', async () => {
    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }
    await handler.GET(req, res)

    expect(prisonerService.getPrisons).toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
      queryTerm: 'test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-on-probation',
        prison: {
          resultsCount: 3,
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 4,
          tabHeading: 'People on probation',
          tabId: 'tab-heading-probation',
        },
      },
      inPrisonResults: [
        {
          kind: LicenceKind.CRD,
          licenceId: 1,
          name: 'Test Person 1',
          prisonerNumber: 'A1234AA',
          probationPractitioner: {
            name: 'Test Com 1',
          },
          releaseDate: '01/07/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.APPROVED,
          tabType: 'FUTURE_RELEASES',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: true,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/1/show',
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 2,
          name: 'Test Person 2',
          prisonerNumber: 'A1234AB',
          probationPractitioner: {
            name: 'Test Com 2',
          },
          releaseDate: '01/08/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          tabType: 'FUTURE_RELEASES',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 3,
          name: 'Test Person 3',
          prisonerNumber: 'A1234AC',
          probationPractitioner: {
            name: 'Test Com 3',
          },
          releaseDate: '01/09/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.SUBMITTED,
          tabType: 'FUTURE_RELEASES',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/3/show',
        },
      ],
      onProbationResults: [
        {
          kind: LicenceKind.CRD,
          licenceId: 5,
          name: 'Test Person 5',
          prisonerNumber: 'A1234AE',
          probationPractitioner: {
            name: 'Test Com 5',
          },
          releaseDate: '01/03/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.ACTIVE,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/5/show',
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 6,
          name: 'Test Person 6',
          prisonerNumber: 'A1234AF',
          probationPractitioner: {
            name: 'Test Com 6',
          },
          releaseDate: '01/04/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.TIMED_OUT,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: true,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/hard-stop/create/nomisId/A1234AF/confirm',
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 7,
          name: 'Test Person 7',
          prisonerNumber: 'A1234AG',
          probationPractitioner: {
            name: 'Test Com 7',
          },
          releaseDate: '01/05/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
        },
        {
          kind: LicenceKind.HARD_STOP,
          licenceId: 8,
          name: 'Test Person 8',
          prisonerNumber: 'A1234AH',
          probationPractitioner: {
            name: 'Test Com 8',
          },
          releaseDate: '01/06/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
        },
      ],
      worksAtMoreThanOnePrison: false,
      recallsEnabled: config.recallsEnabled,
    })
  })

  it('should render cases when user has multiple caseloads', async () => {
    res.locals.prisonCaseload = ['LEI', 'BAI']
    searchResponse = {
      inPrisonResults: [
        ...searchResponse.inPrisonResults,
        {
          kind: LicenceKind.CRD,
          licenceId: 4,
          name: 'Test Person 4',
          prisonerNumber: 'A1234AD',
          probationPractitioner: {
            name: 'Test Com 4',
          },
          releaseDate: '01/09/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.APPROVED,
          tabType: 'FUTURE_RELEASES',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        } as CaCase,
      ],
      onProbationResults: [
        ...searchResponse.onProbationResults,
        {
          kind: LicenceKind.CRD,
          licenceId: 9,
          name: 'Test Person 9',
          prisonerNumber: 'A1234AI',
          probationPractitioner: {
            name: 'Test Com 9',
          },
          releaseDate: '01/03/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.ACTIVE,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        } as CaCase,
      ],
    }
    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }
    await handler.GET(req, res)

    expect(prisonerService.getPrisons).toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
      queryTerm: 'test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-on-probation',
        prison: {
          resultsCount: 4,
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 5,
          tabHeading: 'People on probation',
          tabId: 'tab-heading-probation',
        },
      },
      inPrisonResults: [
        {
          kind: LicenceKind.CRD,
          licenceId: 1,
          name: 'Test Person 1',
          prisonerNumber: 'A1234AA',
          probationPractitioner: {
            name: 'Test Com 1',
          },
          releaseDate: '01/07/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.APPROVED,
          tabType: 'FUTURE_RELEASES',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: true,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/1/show',
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 2,
          name: 'Test Person 2',
          prisonerNumber: 'A1234AB',
          probationPractitioner: {
            name: 'Test Com 2',
          },
          releaseDate: '01/08/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          tabType: 'FUTURE_RELEASES',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 3,
          name: 'Test Person 3',
          prisonerNumber: 'A1234AC',
          probationPractitioner: {
            name: 'Test Com 3',
          },
          releaseDate: '01/09/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.SUBMITTED,
          tabType: 'FUTURE_RELEASES',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/3/show',
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 4,
          name: 'Test Person 4',
          prisonerNumber: 'A1234AD',
          probationPractitioner: {
            name: 'Test Com 4',
          },
          releaseDate: '01/09/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.APPROVED,
          tabType: 'FUTURE_RELEASES',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
          link: '/licence/view/id/4/show',
        },
      ],
      onProbationResults: [
        {
          kind: LicenceKind.CRD,
          licenceId: 5,
          name: 'Test Person 5',
          prisonerNumber: 'A1234AE',
          probationPractitioner: {
            name: 'Test Com 5',
          },
          releaseDate: '01/03/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.ACTIVE,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/5/show',
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 6,
          name: 'Test Person 6',
          prisonerNumber: 'A1234AF',
          probationPractitioner: {
            name: 'Test Com 6',
          },
          releaseDate: '01/04/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.TIMED_OUT,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: true,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/hard-stop/create/nomisId/A1234AF/confirm',
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 7,
          name: 'Test Person 7',
          prisonerNumber: 'A1234AG',
          probationPractitioner: {
            name: 'Test Com 7',
          },
          releaseDate: '01/05/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
        },
        {
          kind: LicenceKind.HARD_STOP,
          licenceId: 8,
          name: 'Test Person 8',
          prisonerNumber: 'A1234AH',
          probationPractitioner: {
            name: 'Test Com 8',
          },
          releaseDate: '01/06/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'BAI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 9,
          name: 'Test Person 9',
          prisonerNumber: 'A1234AI',
          probationPractitioner: {
            name: 'Test Com 9',
          },
          releaseDate: '01/03/2025',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.ACTIVE,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
          link: '/licence/view/id/9/show',
        },
      ],
      worksAtMoreThanOnePrison: false,
      recallsEnabled: config.recallsEnabled,
    })
  })

  it('does not call the search service for a blank query', async () => {
    req.query.queryTerm = ''
    await handler.GET(req, res)

    expect(searchService.getCaSearchResults).not.toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
      queryTerm: '',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 0,
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation',
          tabId: 'tab-heading-probation',
        },
      },
      inPrisonResults: [],
      onProbationResults: [],
      worksAtMoreThanOnePrison: false,
      recallsEnabled: config.recallsEnabled,
    })
  })
})
