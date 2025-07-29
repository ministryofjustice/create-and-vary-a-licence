import { Request, Response } from 'express'
import CaSearchRoutes from './caSearch'
import SearchService from '../../../services/searchService'
import LicenceKind from '../../../enumeration/LicenceKind'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { CaCase } from '../../../@types/licenceApiClientTypes'
import statusConfig from '../../../licences/licenceStatus'
import config from '../../../config'

const searchService = new SearchService(null) as jest.Mocked<SearchService>
jest.mock('../../../services/searchService')

describe('Route Handlers - Search - Ca Search', () => {
  const handler = new CaSearchRoutes(searchService)
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
          activeCaseload: 'MDI',
        },
      },
    } as unknown as Response
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
        prisonCode: 'MDI',
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
        prisonCode: 'MDI',
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
        prisonCode: 'MDI',
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
        prisonCode: 'MDI',
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
        prisonCode: 'MDI',
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
        prisonCode: 'MDI',
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
        prisonCode: 'MDI',
        prisonDescription: 'Moorland (HMP)',
      },
    ] as CaCase[],
  }

  it('should render cases and evaluate links when user has a caseload in a single prison', async () => {
    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }
    await handler.GET(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
      queryTerm: 'test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 5,
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 2,
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
          prisonCode: 'MDI',
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
          prisonCode: 'MDI',
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
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/3/show',
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
          licenceStatus: LicenceStatus.NOT_STARTED,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/hard-stop/create/nomisId/A1234AF/confirm',
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
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
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
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/5/show',
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
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
        },
      ],
      selectedMultiplePrisonCaseloads: false,
      recallsEnabled: config.recallsEnabled,
    })
  })

  it('should render cases and evaluate links when user has selected multiple caseloads', async () => {
    req.session.caseloadsSelected = ['MDI', 'LEI']
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

    expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
      queryTerm: 'test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 6,
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 3,
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
          prisonCode: 'MDI',
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
          prisonCode: 'MDI',
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
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/3/show',
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
          licenceStatus: LicenceStatus.NOT_STARTED,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/hard-stop/create/nomisId/A1234AF/confirm',
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
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
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
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/5/show',
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
          prisonCode: 'MDI',
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
      selectedMultiplePrisonCaseloads: true,
      recallsEnabled: config.recallsEnabled,
    })
  })

  it('should allow creation of hardstop licence during hardstop and should override the TIMED_OUT status to NOT_STARTED', async () => {
    searchResponse = {
      inPrisonResults: [
        {
          kind: LicenceKind.CRD,
          licenceId: 6,
          name: 'Test Person 6',
          prisonerNumber: 'A1234AB',
          probationPractitioner: {
            name: 'Test Com 3',
          },
          releaseDate: '01/06/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.TIMED_OUT,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        },
        {
          kind: LicenceKind.HARD_STOP,
          licenceId: 7,
          name: 'Test Person 7',
          prisonerNumber: 'A1234AC',
          probationPractitioner: {
            name: 'Test Com 4',
          },
          releaseDate: '01/05/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        },
      ],
      onProbationResults: [
        {
          licenceId: 8,
          name: 'Test Person 8',
          prisonerNumber: 'A1234AD',
          probationPractitioner: {
            name: 'Test Com 5',
          },
          releaseDate: '01/05/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.VARIATION_APPROVED,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 9,
          name: 'Test Person 9',
          prisonerNumber: 'A1234AI',
          probationPractitioner: {
            name: 'Test Com 4',
          },
          releaseDate: '01/07/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.ACTIVE,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        },
      ],
    }

    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }
    await handler.GET(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
      queryTerm: 'test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 2,
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 2,
          tabHeading: 'People on probation',
          tabId: 'tab-heading-probation',
        },
      },
      inPrisonResults: [
        {
          kind: LicenceKind.CRD,
          licenceId: 6,
          name: 'Test Person 6',
          prisonerNumber: 'A1234AB',
          probationPractitioner: {
            name: 'Test Com 3',
          },
          releaseDate: '01/06/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.NOT_STARTED,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
          link: '/licence/hard-stop/create/nomisId/A1234AB/confirm',
        },
        {
          kind: LicenceKind.HARD_STOP,
          licenceId: 7,
          name: 'Test Person 7',
          prisonerNumber: 'A1234AC',
          probationPractitioner: {
            name: 'Test Com 4',
          },
          releaseDate: '01/05/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
          link: '/licence/hard-stop/id/7/check-your-answers',
        },
      ],
      onProbationResults: [
        {
          licenceId: 8,
          name: 'Test Person 8',
          prisonerNumber: 'A1234AD',
          probationPractitioner: {
            name: 'Test Com 5',
          },
          releaseDate: '01/05/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.VARIATION_APPROVED,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: false,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
          link: null,
        },
        {
          kind: LicenceKind.CRD,
          licenceId: 9,
          name: 'Test Person 9',
          prisonerNumber: 'A1234AI',
          probationPractitioner: {
            name: 'Test Com 4',
          },
          releaseDate: '01/07/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.ACTIVE,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
          link: '/licence/view/id/9/show',
        },
      ],
      selectedMultiplePrisonCaseloads: false,
      recallsEnabled: config.recallsEnabled,
    })
  })

  it('should allow creation of hardstop licence for existing TIMED_OUT licences', async () => {
    searchResponse = {
      inPrisonResults: [
        {
          kind: LicenceKind.CRD,
          licenceId: 6,
          name: 'Test Person 6',
          prisonerNumber: 'A1234AB',
          probationPractitioner: {
            name: 'Test Com 3',
          },
          releaseDate: '01/06/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.TIMED_OUT,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        },
      ],
      onProbationResults: [],
    }

    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }
    await handler.GET(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
      queryTerm: 'test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 1,
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation',
          tabId: 'tab-heading-probation',
        },
      },
      inPrisonResults: [
        {
          kind: LicenceKind.CRD,
          licenceId: 6,
          name: 'Test Person 6',
          prisonerNumber: 'A1234AB',
          probationPractitioner: {
            name: 'Test Com 3',
          },
          releaseDate: '01/06/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.NOT_STARTED,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
          link: '/licence/hard-stop/create/nomisId/A1234AB/confirm',
        },
      ],
      onProbationResults: [],
      selectedMultiplePrisonCaseloads: false,
      recallsEnabled: config.recallsEnabled,
    })
  })

  it('should allow modifying inprogress hardstop licence during hardstop', async () => {
    searchResponse = {
      inPrisonResults: [
        {
          kind: LicenceKind.HARD_STOP,
          licenceId: 7,
          name: 'Test Person 7',
          prisonerNumber: 'A1234AC',
          probationPractitioner: {
            name: 'Test Com 4',
          },
          releaseDate: '01/05/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        },
      ],
      onProbationResults: [],
    }

    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }
    await handler.GET(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
      queryTerm: 'test',
      backLink: '/licence/view/cases',
      statusConfig,
      tabParameters: {
        activeTab: '#people-in-prison',
        prison: {
          resultsCount: 1,
          tabHeading: 'People in prison',
          tabId: 'tab-heading-prison',
        },
        probation: {
          resultsCount: 0,
          tabHeading: 'People on probation',
          tabId: 'tab-heading-probation',
        },
      },
      inPrisonResults: [
        {
          kind: LicenceKind.HARD_STOP,
          licenceId: 7,
          name: 'Test Person 7',
          prisonerNumber: 'A1234AC',
          probationPractitioner: {
            name: 'Test Com 4',
          },
          releaseDate: '01/05/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isDueForEarlyRelease: true,
          isInHardStopPeriod: true,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
          link: '/licence/hard-stop/id/7/check-your-answers',
        },
      ],
      onProbationResults: [],
      selectedMultiplePrisonCaseloads: false,
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
      selectedMultiplePrisonCaseloads: false,
      recallsEnabled: config.recallsEnabled,
    })
  })
})
