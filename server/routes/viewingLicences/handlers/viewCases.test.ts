import { Request, Response } from 'express'
import ViewAndPrintCaseRoutes from './viewCases'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import PrisonerService from '../../../services/prisonerService'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import { CaViewCasesTab } from '../../../utils/utils'
import LicenceKind from '../../../enumeration/LicenceKind'
import CaCaseloadService from '../../../services/lists/caCaseloadService'
import { CaCase } from '../../../@types/licenceApiClientTypes'

const caseloadService = new CaCaseloadService(null) as jest.Mocked<CaCaseloadService>
jest.mock('../../../services/lists/caCaseloadService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

describe('Route handlers - View and print case list', () => {
  const handler = new ViewAndPrintCaseRoutes(caseloadService, prisonerService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      query: {
        search: '',
      },
      session: { caseloadsSelected: [] },
    } as unknown as Request

    res = {
      header: jest.fn(),
      send: jest.fn(),
      render: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
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

  const caCase = [
    {
      kind: LicenceKind.CRD,
      licenceId: 1,
      name: 'Bob Smith',
      prisonerNumber: 'A1234AA',
      probationPractitioner: {
        name: 'Sherlock Holmes',
      },
      releaseDate: '01/05/2022',
      releaseDateLabel: 'Confirmed release date',
      licenceStatus: LicenceStatus.NOT_STARTED,
      tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
      nomisLegalStatus: 'SENTENCED',
      lastWorkedOnBy: 'Test Updater',
      isDueForEarlyRelease: false,
      isInHardStopPeriod: true,
    },
    {
      kind: LicenceKind.CRD,
      licenceId: 2,
      name: 'Stephen Rowe',
      prisonerNumber: 'A1234AE',
      probationPractitioner: {
        name: 'Larry Johnson',
      },
      releaseDate: '10/06/2022',
      releaseDateLabel: 'Confirmed release date',
      licenceStatus: LicenceStatus.APPROVED,
      tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
      nomisLegalStatus: 'SENTENCED',
      lastWorkedOnBy: 'Test Updater',
      isDueForEarlyRelease: false,
      isInHardStopPeriod: true,
    },
    {
      kind: LicenceKind.CRD,
      licenceId: 3,
      name: 'Harvey Smith',
      prisonerNumber: 'A1234AC',
      probationPractitioner: {
        name: 'Walter White',
      },
      releaseDate: '01/05/2022',
      releaseDateLabel: 'Confirmed release date',
      licenceStatus: LicenceStatus.IN_PROGRESS,
      tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
      nomisLegalStatus: 'SENTENCED',
      lastWorkedOnBy: 'Test Updater',
      isDueForEarlyRelease: false,
      isInHardStopPeriod: true,
    },
    {
      kind: LicenceKind.CRD,
      licenceId: 4,
      name: 'Harold Lloyd',
      prisonerNumber: 'A1234AD',
      probationPractitioner: {
        name: 'Harry Goldman',
      },
      releaseDate: '01/05/2022',
      releaseDateLabel: 'CRD',
      licenceStatus: LicenceStatus.SUBMITTED,
      tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
      nomisLegalStatus: 'SENTENCED',
      lastWorkedOnBy: 'Test Updater',
      isDueForEarlyRelease: true,
      isInHardStopPeriod: true,
    },
  ] as CaCase[]
  const prisonCaseload = caCase as CaCase[]

  describe('GET', () => {
    const probationCaseLoad = [
      {
        kind: LicenceKind.CRD,
        licenceId: 5,
        licenceStatus: LicenceStatus.ACTIVE,
        isDueForEarlyRelease: true,
        isInHardStopPeriod: true,
        releaseDate: '01/07/2022',
        releaseDateLabel: 'Confirmed release date',
        probationPractitioner: {
          name: 'Sherlock Holmes',
        },
        name: 'Bob Smith',
        prisonerNumber: 'A1234AA',
        tabType: 'RELEASES_IN_NEXT_TWO_WORKING_DAYS',
        nomisLegalStatus: 'SENTENCED',
        lastWorkedOnBy: 'Test Updater',
      },
      {
        ...caCase,
        licenceId: 6,
        licenceStatus: LicenceStatus.TIMED_OUT,
        isDueForEarlyRelease: true,
        isInHardStopPeriod: true,
        releaseDate: '01/06/2022',
        releaseDateLabel: 'Confirmed release date',
        prisonerNumber: 'A1234AB',
        probationPractitioner: {
          name: 'Thor',
        },
      },
      {
        ...caCase,
        kind: LicenceKind.HARD_STOP,
        licenceId: 7,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        isDueForEarlyRelease: true,
        isInHardStopPeriod: true,
        releaseDate: '01/05/2022',
        releaseDateLabel: 'Confirmed release date',
        prisonerNumber: 'A1234AC',
        probationPractitioner: {
          name: 'Walter White',
        },
      },
      {
        ...caCase,
        licenceId: 8,
        licenceStatus: LicenceStatus.VARIATION_APPROVED,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: true,
        releaseDate: '01/05/2022',
        releaseDateLabel: 'Confirmed release date',
        prisonerNumber: 'A1234AD',
        probationPractitioner: {
          name: 'Harry Goldman',
        },
      },
    ] as CaCase[]

    it('should render cases when user only has 1 caseloaded prison', async () => {
      caseloadService.getPrisonOmuCaseload.mockResolvedValue(prisonCaseload)
      res.locals.prisonCaseload = ['BAI']
      await handler.GET(req, res)

      expect(prisonerService.getPrisons).toHaveBeenCalled()

      expect(caseloadService.getPrisonOmuCaseload).toHaveBeenCalledWith(
        { username: 'joebloggs', activeCaseload: 'BAI', prisonCaseload: ['BAI'] },
        ['BAI'],
        '',
      )
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            link: null,
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'Test Updater',
            isDueForEarlyRelease: false,
          },
          {
            link: '/licence/view/id/2/show',
            licenceId: 2,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            link: null,
            licenceId: 3,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
          },
          {
            link: '/licence/view/id/4/show',
            licenceId: 4,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: true,
            lastWorkedOnBy: 'Test Updater',
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: '',
        statusConfig,
      })
    })

    it('should evaluate the links of cases for probation view', async () => {
      caseloadService.getProbationOmuCaseload.mockResolvedValue(probationCaseLoad)
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'probation'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isDueForEarlyRelease: true,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 5,
            licenceStatus: 'ACTIVE',
            link: '/licence/view/id/5/show',
            name: 'Bob Smith',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 Jul 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            isDueForEarlyRelease: true,
            licenceId: 6,
            licenceStatus: 'NOT_STARTED',
            link: '/licence/hard-stop/create/nomisId/A1234AB/confirm',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 Jun 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isDueForEarlyRelease: true,
            licenceId: 7,
            licenceStatus: 'IN_PROGRESS',
            link: '/licence/hard-stop/id/7/check-your-answers',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isDueForEarlyRelease: false,
            licenceId: 8,
            licenceStatus: 'VARIATION_APPROVED',
            link: null,
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: true,
        search: '',
        statusConfig,
      })
    })

    it('should evaluate the links of cases for prison view', async () => {
      caseloadService.getPrisonOmuCaseload.mockResolvedValue(prisonCaseload)
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            link: null,
            name: 'Bob Smith',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 2,
            licenceStatus: 'APPROVED',
            link: '/licence/view/id/2/show',
            name: 'Stephen Rowe',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 3,
            licenceStatus: 'IN_PROGRESS',
            link: null,
            name: 'Harvey Smith',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            isDueForEarlyRelease: true,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 4,
            licenceStatus: 'SUBMITTED',
            link: '/licence/view/id/4/show',
            name: 'Harold Lloyd',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'releasesInNextTwoWorkingDays',
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: '',
        statusConfig,
      })
    })

    it('should allow creation of hardstop licence during hardstop and should override the TIMED_OUT status to NOT_STARTED', async () => {
      caseloadService.getPrisonOmuCaseload.mockResolvedValue(probationCaseLoad)
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isDueForEarlyRelease: true,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 5,
            licenceStatus: 'ACTIVE',
            link: '/licence/view/id/5/show',
            name: 'Bob Smith',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 Jul 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            isDueForEarlyRelease: true,
            licenceId: 6,
            licenceStatus: 'NOT_STARTED',
            link: '/licence/hard-stop/create/nomisId/A1234AB/confirm',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 Jun 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isDueForEarlyRelease: true,
            licenceId: 7,
            licenceStatus: 'IN_PROGRESS',
            link: '/licence/hard-stop/id/7/check-your-answers',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isDueForEarlyRelease: false,
            licenceId: 8,
            licenceStatus: 'VARIATION_APPROVED',
            link: null,
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: '',
        statusConfig,
      })
    })

    it('should allow creation of hardstop licence for existing TIMED_OUT licences', async () => {
      caseloadService.getPrisonOmuCaseload.mockResolvedValue([probationCaseLoad[1] as CaCase])
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            licenceId: 6,
            licenceStatus: 'NOT_STARTED',
            link: '/licence/hard-stop/create/nomisId/A1234AB/confirm',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 Jun 2022',
            releaseDateLabel: 'Confirmed release date',
            isDueForEarlyRelease: true,
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: '',
        statusConfig,
      })
    })

    it('should allow modifying inprogress hardstop licence during hardstop', async () => {
      caseloadService.getPrisonOmuCaseload.mockResolvedValue([probationCaseLoad[2] as CaCase])
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            licenceId: 7,
            licenceStatus: 'IN_PROGRESS',
            link: '/licence/hard-stop/id/7/check-your-answers',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            isDueForEarlyRelease: true,
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: '',
        statusConfig,
      })
    })

    it('should evaluate the links of cases for prison view in hardstop', async () => {
      caseloadService.getPrisonOmuCaseload.mockResolvedValue(probationCaseLoad)
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isDueForEarlyRelease: true,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 5,
            licenceStatus: 'ACTIVE',
            link: '/licence/view/id/5/show',
            name: 'Bob Smith',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 Jul 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            isDueForEarlyRelease: true,
            licenceId: 6,
            licenceStatus: 'NOT_STARTED',
            link: '/licence/hard-stop/create/nomisId/A1234AB/confirm',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 Jun 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isDueForEarlyRelease: true,
            licenceId: 7,
            licenceStatus: 'IN_PROGRESS',
            link: '/licence/hard-stop/id/7/check-your-answers',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isDueForEarlyRelease: false,
            licenceId: 8,
            licenceStatus: 'VARIATION_APPROVED',
            link: null,
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: '',
        statusConfig,
      })
    })

    it('should evaluate the tabType of cases', async () => {
      caseloadService.getPrisonOmuCaseload.mockResolvedValue(prisonCaseload)
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            link: null,
            name: 'Bob Smith',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 2,
            licenceStatus: 'APPROVED',
            link: '/licence/view/id/2/show',
            name: 'Stephen Rowe',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 3,
            licenceStatus: 'IN_PROGRESS',
            link: null,
            name: 'Harvey Smith',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            isDueForEarlyRelease: true,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 4,
            licenceStatus: 'SUBMITTED',
            link: '/licence/view/id/4/show',
            name: 'Harold Lloyd',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'releasesInNextTwoWorkingDays',
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: '',
        statusConfig,
      })
    })

    it('should return link as null if tabType is ATTENTION_NEEDED', async () => {
      caseloadService.getPrisonOmuCaseload.mockResolvedValue([
        { ...caCase[0], licenceId: 5, tabType: 'ATTENTION_NEEDED' } as CaCase,
      ])
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
            licenceId: 5,
            licenceStatus: 'NOT_STARTED',
            link: null,
            name: 'Bob Smith',
            nomisLegalStatus: 'SENTENCED',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'attentionNeeded',
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: true,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: '',
        statusConfig,
      })
    })
  })
})
