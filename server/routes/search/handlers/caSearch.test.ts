import { Request, Response } from 'express'
import CaSearchRoutes from './caSearch'
import PrisonerService from '../../../services/prisonerService'
import SearchService from '../../../services/searchService'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import { CaCase } from '../../../@types/licenceApiClientTypes'
import statusConfig from '../../../licences/licenceStatus'
import config from '../../../config'
import { CaViewCasesTab, LicenceKind, LicenceStatus } from '../../../enumeration'
import { User } from '../../../@types/CvlUserDetails'

const searchService = new SearchService(null) as jest.Mocked<SearchService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/searchService')
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
    } as unknown as Request

    res = {
      header: jest.fn(),
      send: jest.fn(),
      render: jest.fn(),
      locals: {
        user: {
          hasMultipleCaseloadsInNomis: false,
          prisonCaseloadToDisplay: ['MDI'],
          hasSelectedMultiplePrisonCaseloads: false,
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
        agencyId: 'LEI',
        description: 'Leeds (HMP)',
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
        isInHardStopPeriod: false,
        prisonCode: 'MDI',
        prisonDescription: 'Moorland (HMP)',
      },
    ] as CaCase[],
    attentionNeededResults: [] as CaCase[],
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
        attentionNeeded: {
          resultsCount: 0,
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
          isInHardStopPeriod: false,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: null,
        },
      ],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasMultipleCaseloadsInNomis: false,
      hasSelectedMultiplePrisonCaseloads: false,
      prisonsToDisplay: [
        {
          agencyId: 'MDI',
          description: 'Moorland (HMP)',
        },
      ],
      changeLocationHref: '/licence/view/change-location?queryTerm=test',
      recallsEnabled: config.recallsEnabled,
      isSearchPageView: true,
    })
  })

  it('should render cases and evaluate links when user has selected multiple caseloads', async () => {
    res.locals.user = {
      hasMultipleCaseloadsInNomis: true,
      prisonCaseloadToDisplay: ['MDI', 'LEI'],
      hasSelectedMultiplePrisonCaseloads: true,
    } as User
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
          isInHardStopPeriod: false,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        } as CaCase,
      ],
      attentionNeededResults: [],
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
        attentionNeeded: {
          resultsCount: 0,
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
          isInHardStopPeriod: false,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
          link: '/licence/view/id/9/show',
        },
      ],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasMultipleCaseloadsInNomis: true,
      hasSelectedMultiplePrisonCaseloads: true,
      prisonsToDisplay: [
        {
          agencyId: 'MDI',
          description: 'Moorland (HMP)',
        },
        { agencyId: 'LEI', description: 'Leeds (HMP)' },
      ],
      changeLocationHref: '/licence/view/change-location?queryTerm=test',
      recallsEnabled: config.recallsEnabled,
      isSearchPageView: true,
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
      ],
      attentionNeededResults: [],
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
        attentionNeeded: {
          resultsCount: 0,
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
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
          isInHardStopPeriod: true,
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
            name: 'Test Com 4',
          },
          releaseDate: '01/07/2022',
          releaseDateLabel: 'Confirmed release date',
          licenceStatus: LicenceStatus.ACTIVE,
          tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
          nomisLegalStatus: 'SENTENCED',
          lastWorkedOnBy: 'Test Updater',
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/view/id/9/show',
        },
      ],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasMultipleCaseloadsInNomis: false,
      hasSelectedMultiplePrisonCaseloads: false,
      prisonsToDisplay: [{ agencyId: 'MDI', description: 'Moorland (HMP)' }],
      changeLocationHref: '/licence/view/change-location?queryTerm=test',
      recallsEnabled: config.recallsEnabled,
      isSearchPageView: true,
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
      ],
      onProbationResults: [],
      attentionNeededResults: [],
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
        attentionNeeded: {
          resultsCount: 0,
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/hard-stop/create/nomisId/A1234AB/confirm',
        },
      ],
      onProbationResults: [],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasMultipleCaseloadsInNomis: false,
      hasSelectedMultiplePrisonCaseloads: false,
      prisonsToDisplay: [{ agencyId: 'MDI', description: 'Moorland (HMP)' }],
      changeLocationHref: '/licence/view/change-location?queryTerm=test',
      recallsEnabled: config.recallsEnabled,
      isSearchPageView: true,
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
      ],
      onProbationResults: [],
      attentionNeededResults: [],
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
        attentionNeeded: {
          resultsCount: 0,
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
          isInHardStopPeriod: true,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
          link: '/licence/hard-stop/id/7/check-your-answers',
        },
      ],
      onProbationResults: [],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasMultipleCaseloadsInNomis: false,
      hasSelectedMultiplePrisonCaseloads: false,
      prisonsToDisplay: [{ agencyId: 'MDI', description: 'Moorland (HMP)' }],
      changeLocationHref: '/licence/view/change-location?queryTerm=test',
      recallsEnabled: config.recallsEnabled,
      isSearchPageView: true,
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
        attentionNeeded: {
          resultsCount: 0,
        },
      },
      inPrisonResults: [],
      onProbationResults: [],
      attentionNeededResults: [],
      CaViewCasesTab,
      showAttentionNeededTab: false,
      hasMultipleCaseloadsInNomis: false,
      hasSelectedMultiplePrisonCaseloads: false,
      prisonsToDisplay: [{ agencyId: 'MDI', description: 'Moorland (HMP)' }],
      changeLocationHref: '/licence/view/change-location',
      recallsEnabled: config.recallsEnabled,
      isSearchPageView: true,
    })
  })
})
