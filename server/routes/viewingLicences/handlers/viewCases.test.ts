import { Request, Response } from 'express'

import ViewAndPrintCaseRoutes from './viewCases'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import PrisonerService from '../../../services/prisonerService'

import LicenceType from '../../../enumeration/licenceType'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import Container from '../../../services/container'
import OmuCaselist from '../../../services/omuCaselist'
import type { CvlFields, CvlPrisoner } from '../../../@types/licenceApiClientTypes'
import config from '../../../config'
import { ComCreateCaseTab } from '../../../utils/utils'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
jest.mock('../../../services/caseloadService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

describe('Route handlers - View and print case list', () => {
  const handler = new ViewAndPrintCaseRoutes(caseloadService, prisonerService)
  let req: Request
  let res: Response

  const cvlFields: CvlFields = {
    licenceType: LicenceType.AP,
    hardStopDate: '03/01/2023',
    hardStopWarningDate: '01/01/2023',
    isInHardStopPeriod: true,
    isDueForEarlyRelease: false,
  }

  beforeEach(() => {
    req = {
      query: {},
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
    caseloadService.getCutOffDateForLicenceTimeOut.mockResolvedValue({ cutoffDate: '01 May 2022' })
    config.hardStopEnabled = false
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    const caseList = new Container([
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.NOT_STARTED,
          },
        ],
        cvlFields,
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          confirmedReleaseDate: '2022-05-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Sherlock Holmes',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.IN_PROGRESS,
          },
        ],
        cvlFields,
        nomisRecord: {
          firstName: 'Harvey',
          lastName: 'Smith',
          prisonerNumber: 'A1234AC',
          conditionalReleaseDate: '2022-05-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.SUBMITTED,
          },
        ],
        cvlFields,
        nomisRecord: {
          firstName: 'Harold',
          lastName: 'Lloyd',
          prisonerNumber: 'A1234AD',
          conditionalReleaseDate: '2022-05-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Harry Goldman',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.APPROVED,
          },
        ],
        cvlFields,
        nomisRecord: {
          firstName: 'Stephen',
          lastName: 'Rowe',
          prisonerNumber: 'A1234AE',
          conditionalReleaseDate: '2022-06-10',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Larry Johnson',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.ACTIVE,
          },
        ],
        cvlFields,
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          confirmedReleaseDate: '2022-07-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Sherlock Holmes',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.VARIATION_IN_PROGRESS,
          },
        ],
        cvlFields,
        nomisRecord: {
          firstName: 'Joe',
          lastName: 'Bloggs',
          prisonerNumber: 'A1234AB',
          conditionalReleaseDate: '2022-06-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Thor',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.VARIATION_SUBMITTED,
          },
        ],
        cvlFields,
        nomisRecord: {
          firstName: 'Harvey',
          lastName: 'Smith',
          prisonerNumber: 'A1234AC',
          conditionalReleaseDate: '2022-05-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.VARIATION_APPROVED,
          },
        ],
        cvlFields,
        nomisRecord: {
          firstName: 'Harold',
          lastName: 'Lloyd',
          prisonerNumber: 'A1234AD',
          conditionalReleaseDate: '2022-05-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Harry Goldman',
        },
      },
    ])

    it('should render cases when user only has 1 caseloaded prison', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      res.locals.prisonCaseload = ['BAI']
      await handler.GET(req, res)

      expect(prisonerService.getPrisons).toHaveBeenCalled()

      expect(caseloadService.getOmuCaseload).toHaveBeenCalledWith(
        { username: 'joebloggs', activeCaseload: 'BAI', prisonCaseload: ['BAI'] },
        ['BAI']
      )
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: undefined,
        statusConfig,
      })
    })

    it('should render cases when user selects prison which is not their currently active prison', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      res.locals.user.prisonCaseload = ['BAI', 'MDI']
      req.session.caseloadsSelected = ['MDI']

      await handler.GET(req, res)

      expect(caseloadService.getOmuCaseload).toHaveBeenCalledWith(
        {
          activeCaseload: 'BAI',
          prisonCaseload: ['BAI', 'MDI'],
          username: 'joebloggs',
        },
        ['MDI']
      )

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: true,
        prisonsToDisplay: [
          {
            agencyId: 'MDI',
            description: 'Moorland (HMP)',
          },
        ],
        probationView: false,
        search: undefined,
        statusConfig,
      })
    })

    it('should render list of licences for multiple selected prisons', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      req.session.caseloadsSelected = ['MDI', 'BXI']
      res.locals.user.prisonCaseload = ['BAI', 'MDI', 'BXI']
      await handler.GET(req, res)

      expect(caseloadService.getOmuCaseload).toHaveBeenCalledWith(
        { username: 'joebloggs', activeCaseload: 'BAI', prisonCaseload: ['BAI', 'MDI', 'BXI'] },
        ['MDI', 'BXI']
      )
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: true,
        prisonsToDisplay: [
          {
            agencyId: 'BXI',
            description: 'Brixton (HMP)',
          },
          {
            agencyId: 'MDI',
            description: 'Moorland (HMP)',
          },
        ],
        probationView: false,
        search: undefined,
        statusConfig,
      })
    })

    it('should render licences for for People In Prison in ascending order', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      req.session.caseloadsSelected = ['MDI']
      res.locals.user.prisonCaseload = ['MDI']
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'MDI',
            description: 'Moorland (HMP)',
          },
        ],
        probationView: false,
        search: undefined,
        statusConfig,
      })
    })

    it('should render licences for for People On Probation in descending order', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      req.session.caseloadsSelected = ['MDI']
      res.locals.user.prisonCaseload = ['MDI']
      req.query.view = 'probation'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'ACTIVE',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 Jul 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'VARIATION_IN_PROGRESS',
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 Jun 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'VARIATION_SUBMITTED',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'VARIATION_APPROVED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'MDI',
            description: 'Moorland (HMP)',
          },
        ],
        probationView: true,
        search: undefined,
        statusConfig,
      })
    })

    it('should successfully search by name', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      req.query.search = 'bob'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: 'bob',
        statusConfig,
      })
    })

    it('should successfully search by prison number', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      req.query.search = 'A1234AA'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            licenceId: undefined,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isClickable: false,
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: 'A1234AA',
        statusConfig,
      })
    })

    it('should successfully search by probation practitioner', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      req.query.search = 'holmes'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: 'holmes',
        statusConfig,
      })
    })

    it('should evaluate the clickability of cases for probation view', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'probation'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'ACTIVE',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 Jul 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'VARIATION_IN_PROGRESS',
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 Jun 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'VARIATION_SUBMITTED',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'VARIATION_APPROVED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: true,
        search: undefined,
        statusConfig,
      })
    })

    it('should evaluate the clickability of cases for prison view', async () => {
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: undefined,
        statusConfig,
      })
    })

    it('should render in progress licence if an offender has an approved and in progress version', async () => {
      const multipleLicencesCaseList = new Container([
        {
          licences: [
            {
              id: 45,
              type: LicenceType.AP,
              status: LicenceStatus.APPROVED,
            },
            {
              id: 67,
              type: LicenceType.AP,
              status: LicenceStatus.IN_PROGRESS,
              versionOf: 45,
            },
          ],
          cvlFields,
          nomisRecord: {
            firstName: 'Bob',
            lastName: 'Smith',
            prisonerNumber: 'A1234AA',
            confirmedReleaseDate: '2022-05-01',
            legalStatus: 'SENTENCED',
          } as CvlPrisoner,
          probationPractitioner: {
            name: 'Sherlock Holmes',
          },
        },
      ])
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(multipleLicencesCaseList))
      res.locals.prisonCaseload = ['BAI']
      await handler.GET(req, res)

      expect(prisonerService.getPrisons).toHaveBeenCalled()

      expect(caseloadService.getOmuCaseload).toHaveBeenCalledWith(
        { username: 'joebloggs', activeCaseload: 'BAI', prisonCaseload: ['BAI'] },
        ['BAI']
      )
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: 67,
            licenceVersionOf: 45,
            licenceStatus: 'IN_PROGRESS',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: undefined,
        statusConfig,
      })
    })

    it('should evaluate the tabType of cases', async () => {
      caseloadService.getCutOffDateForLicenceTimeOut.mockResolvedValue({ cutoffDate: '02/05/2022' })
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
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
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
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
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: undefined,
        statusConfig,
      })
    })

    it('should return tabType as futureReleases if cutoffDate is null', async () => {
      caseloadService.getCutOffDateForLicenceTimeOut.mockResolvedValue({ cutoffDate: '' })
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseList))
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: true,
            licenceId: undefined,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: undefined,
        statusConfig,
      })
    })

    it('should return tab type as attentionNeeded if release date is null', async () => {
      config.hardStopEnabled = true
      caseloadService.getCutOffDateForLicenceTimeOut.mockResolvedValue({ cutoffDate: '02/05/2022' })
      const caseLoadWithEmptyReleaseDate = new Container([
        {
          licences: [
            {
              type: LicenceType.AP,
              status: LicenceStatus.APPROVED,
            },
          ],
          cvlFields,
          nomisRecord: {
            firstName: 'Bob',
            lastName: 'Smith',
            prisonerNumber: 'A1234AA',
            confirmedReleaseDate: '',
            legalStatus: 'SENTENCED',
          } as CvlPrisoner,
          probationPractitioner: {
            name: 'Sherlock Holmes',
          },
        },
        {
          licences: [
            {
              type: LicenceType.AP,
              status: LicenceStatus.IN_PROGRESS,
            },
          ],
          cvlFields,
          nomisRecord: {
            firstName: 'Harvey',
            lastName: 'Smith',
            prisonerNumber: 'A1234AC',
            conditionalReleaseDate: null,
            legalStatus: 'SENTENCED',
          } as CvlPrisoner,
          probationPractitioner: {
            name: 'Walter White',
          },
        },
      ])
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseLoadWithEmptyReleaseDate))
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'APPROVED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: 'not found',
            releaseDateLabel: 'CRD',
            tabType: 'attentionNeeded',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            isClickable: false,
            licenceId: undefined,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: 'not found',
            releaseDateLabel: 'CRD',
            tabType: 'attentionNeeded',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
        ],
        ComCreateCaseTab,
        showAttentionNeededTab: true,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: undefined,
        statusConfig,
      })
    })

    it('should return showAttentionNeededTab true even if search results has no attention needed cases', async () => {
      config.hardStopEnabled = true
      req.query.search = 'A12345AA'
      caseloadService.getCutOffDateForLicenceTimeOut.mockResolvedValue({ cutoffDate: '02/05/2022' })
      const caseLoadWithEmptyReleaseDate = new Container([
        {
          licences: [
            {
              type: LicenceType.AP,
              status: LicenceStatus.APPROVED,
            },
          ],
          cvlFields,
          nomisRecord: {
            firstName: 'Bob',
            lastName: 'Smith',
            prisonerNumber: 'A1234AA',
            confirmedReleaseDate: '',
            legalStatus: 'SENTENCED',
          } as CvlPrisoner,
          probationPractitioner: {
            name: 'Sherlock Holmes',
          },
        },
        {
          licences: [
            {
              type: LicenceType.AP,
              status: LicenceStatus.IN_PROGRESS,
            },
          ],
          cvlFields,
          nomisRecord: {
            firstName: 'Harvey',
            lastName: 'Smith',
            prisonerNumber: 'A1234AC',
            conditionalReleaseDate: null,
            legalStatus: 'SENTENCED',
          } as CvlPrisoner,
          probationPractitioner: {
            name: 'Walter White',
          },
        },
      ])
      caseloadService.getOmuCaseload.mockResolvedValue(new OmuCaselist(caseLoadWithEmptyReleaseDate))
      res.locals.user.prisonCaseload = ['BAI']
      req.query.view = 'prison'
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [],
        ComCreateCaseTab,
        showAttentionNeededTab: true,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: 'A12345AA',
        statusConfig,
      })
    })

    describe('GET_WITH_EXCLUSIONS', () => {
      it('should render list of licences and display the currently active caseload prison', async () => {
        res.locals.prisonCaseload = ['BAI']
        const omuCaselist = new OmuCaselist(caseList)
        caseloadService.getOmuCaseload.mockResolvedValue(omuCaselist)

        await handler.GET_WITH_EXCLUSIONS(req, res)

        expect(prisonerService.getPrisons).toHaveBeenCalled()

        expect(caseloadService.getOmuCaseload).toHaveBeenCalledWith(
          { username: 'joebloggs', activeCaseload: 'BAI', prisonCaseload: ['BAI'] },
          ['BAI']
        )
        expect(res.header).toHaveBeenCalledWith('Content-Type', 'application/json')
        expect(res.send).toHaveBeenCalledWith(JSON.stringify(omuCaselist.getPrisonView(), null, 4))
      })
    })
  })
})
