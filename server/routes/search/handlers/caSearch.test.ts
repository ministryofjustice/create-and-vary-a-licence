import { Request, Response } from 'express'
import CaSearchRoutes from './caSearch'
import PrisonerService from '../../../services/prisonerService'
import SearchService from '../../../services/searchService'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import { CaCase } from '../../../@types/licenceApiClientTypes'
import statusConfig from '../../../licences/licenceStatus'
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
        hasNomisLicence: false,
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
        hasNomisLicence: false,
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
        hasNomisLicence: false,
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
        hasNomisLicence: false,
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
        hasNomisLicence: false,
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
        hasNomisLicence: false,
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
        hasNomisLicence: false,
        prisonCode: 'MDI',
        prisonDescription: 'Moorland (HMP)',
      },
    ] as CaCase[],
    attentionNeededResults: [] as CaCase[],
  }

  it('should render cases and evaluate links when user has a caseload in a single prison', async () => {
    // Given
    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }

    // When
    await handler.GET(req, res)

    // Then
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
      isSearchPageView: true,
    })
  })

  it('should render cases and evaluate links when user has selected multiple caseloads', async () => {
    // Given
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        } as CaCase,
      ],
      attentionNeededResults: [],
    }
    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }

    // When
    await handler.GET(req, res)

    // Then
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
      isSearchPageView: true,
    })
  })

  it('should allow creation of hardstop licence during hardstop and should override the TIMED_OUT status to NOT_STARTED', async () => {
    // Given
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
      ],
      attentionNeededResults: [],
    }

    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }

    // When
    await handler.GET(req, res)

    // Then
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
          hasNomisLicence: false,
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
      isSearchPageView: true,
    })
  })

  it('should allow creation of hardstop licence for existing TIMED_OUT licences', async () => {
    // Given
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
          hasNomisLicence: false,
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
      ],
      onProbationResults: [],
      attentionNeededResults: [],
    }

    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }

    // When
    await handler.GET(req, res)

    // Then
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
          hasNomisLicence: false,
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
      isSearchPageView: true,
    })
  })

  it('should allow modifying in-progress hardstop licence during hardstop', async () => {
    // Given
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
          hasNomisLicence: false,
        },
      ],
      onProbationResults: [],
      attentionNeededResults: [],
    }

    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }

    // When
    await handler.GET(req, res)

    // Then
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
          hasNomisLicence: false,
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
      isSearchPageView: true,
    })
  })

  it('trims the search query', async () => {
    // Given
    const queryTerm = '   test query   '
    searchResponse = {
      inPrisonResults: [],
      onProbationResults: [],
      attentionNeededResults: [],
    }

    searchService.getCaSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm }

    const trimmedQueryTerm = queryTerm.trim()

    // When
    await handler.GET(req, res)

    // Then
    expect(searchService.getCaSearchResults).toHaveBeenCalledWith(trimmedQueryTerm, ['MDI'])
    expect(res.render).toHaveBeenCalledWith('pages/search/caSearch/caSearch', {
      queryTerm: trimmedQueryTerm,
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
      changeLocationHref: `/licence/view/change-location?queryTerm=${trimmedQueryTerm}`,
      isSearchPageView: true,
    })
  })

  it('does not call the search service for a blank query', async () => {
    // Given
    req.query.queryTerm = ''

    // When
    await handler.GET(req, res)

    // Then
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
      isSearchPageView: true,
    })
  })

  it('should return time-served creation link for TIMED_OUT licence with TIME_SERVED kind', async () => {
    // Given
    const timeServedCase = createCase({
      kind: LicenceKind.TIME_SERVED,
      licenceStatus: LicenceStatus.TIMED_OUT,
      prisonerNumber: 'A1234TS',
      isInHardStopPeriod: true,
    })

    // When
    const link = handler.getLink(timeServedCase)

    // Then
    expect(link).toBe('/licence/time-served/create/nomisId/A1234TS/do-you-want-to-create-the-licence-on-this-service')
  })

  it('should return time-served creation link for TIMED_OUT licence with hardStopKind TIME_SERVED', async () => {
    // Given
    const timeServedCase = createCase({
      kind: LicenceKind.CRD,
      hardStopKind: LicenceKind.TIME_SERVED,
      licenceStatus: LicenceStatus.TIMED_OUT,
      prisonerNumber: 'A1234TS',
      isInHardStopPeriod: true,
    })

    // When
    const link = handler.getLink(timeServedCase)

    // Then
    expect(link).toBe('/licence/time-served/create/nomisId/A1234TS/do-you-want-to-create-the-licence-on-this-service')
  })

  it('should return time-served check-your-answers link for in-progress TIME_SERVED licence in hard stop period', async () => {
    // Given
    const timeServedCase = createCase({
      kind: LicenceKind.TIME_SERVED,
      licenceId: 10,
      licenceStatus: LicenceStatus.IN_PROGRESS,
      isInHardStopPeriod: true,
    })

    // When
    const link = handler.getLink(timeServedCase)

    // Then
    expect(link).toBe('/licence/time-served/id/10/check-your-answers')
  })

  const createCase = (overrides = {}): CaCase => {
    return {
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
      isInHardStopPeriod: false,
      hasNomisLicence: false,
      prisonCode: 'MDI',
      prisonDescription: 'Moorland (HMP)',
      ...overrides,
    } as CaCase
  }
})
