import { Request, Response } from 'express'

import ViewAndPrintCaseRoutes from './viewCases'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import PrisonerService from '../../../services/prisonerService'

import LicenceType from '../../../enumeration/licenceType'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import Container from '../../../services/container'
import OmuCaselist from '../../../services/omuCaselist'
import LicenceKind from '../../../enumeration/LicenceKind'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
jest.mock('../../../services/caseloadService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

describe('Route handlers - View and print case list', () => {
  const handler = new ViewAndPrintCaseRoutes(caseloadService, prisonerService)
  let req: Request
  let res: Response

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
            kind: LicenceKind.CRD,
          },
        ],
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          confirmedReleaseDate: '2022-05-01',
        } as Prisoner,
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
        nomisRecord: {
          firstName: 'Harvey',
          lastName: 'Smith',
          prisonerNumber: 'A1234AC',
          conditionalReleaseDate: '2022-05-01',
        } as Prisoner,
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
        nomisRecord: {
          firstName: 'Harold',
          lastName: 'Lloyd',
          prisonerNumber: 'A1234AD',
          conditionalReleaseDate: '2022-05-01',
        } as Prisoner,
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
        nomisRecord: {
          firstName: 'Stephen',
          lastName: 'Rowe',
          prisonerNumber: 'A1234AE',
          conditionalReleaseDate: '2022-06-10',
        } as Prisoner,
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
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          confirmedReleaseDate: '2022-07-01',
        } as Prisoner,
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
        nomisRecord: {
          firstName: 'Joe',
          lastName: 'Bloggs',
          prisonerNumber: 'A1234AB',
          conditionalReleaseOverrideDate: '2022-06-01',
        } as Prisoner,
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
        nomisRecord: {
          firstName: 'Harvey',
          lastName: 'Smith',
          prisonerNumber: 'A1234AC',
          conditionalReleaseDate: '2022-05-01',
        } as Prisoner,
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
        nomisRecord: {
          firstName: 'Harold',
          lastName: 'Lloyd',
          prisonerNumber: 'A1234AD',
          conditionalReleaseDate: '2022-05-01',
        } as Prisoner,
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
            hardStop: false,
            kind: 'CRD',
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
          },
        ],
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
            hardStop: false,
            kind: 'CRD',
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
          },
        ],
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
            hardStop: false,
            kind: 'CRD',
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
          },
        ],
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
            hardStop: false,
            kind: 'CRD',
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
          },
        ],
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
          },
        ],
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
            hardStop: false,
            kind: 'CRD',
          },
        ],
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
            hardStop: false,
            kind: 'CRD',
          },
        ],
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
            hardStop: false,
            kind: 'CRD',
          },
        ],
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
          },
        ],

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
            hardStop: false,
            kind: 'CRD',
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
          },
        ],

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
          nomisRecord: {
            firstName: 'Bob',
            lastName: 'Smith',
            prisonerNumber: 'A1234AA',
            confirmedReleaseDate: '2022-05-01',
          } as Prisoner,
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
            hardStop: false,
          },
        ],
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

    it('should evaluate the hardstop flag of cases', async () => {
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
            hardStop: true,
            kind: 'CRD',
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
            hardStop: true,
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
            hardStop: true,
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
            hardStop: false,
          },
        ],

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

    it('should return hardstop flag as false if cutoffDate is null', async () => {
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
            hardStop: false,
            kind: 'CRD',
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
            hardStop: false,
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
            hardStop: false,
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
            hardStop: false,
          },
        ],

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

    it('should return hardstop flag as false if release date is null', async () => {
      caseloadService.getCutOffDateForLicenceTimeOut.mockResolvedValue({ cutoffDate: '02/05/2022' })
      const caseLoadWithEmptyReleaseDate = new Container([
        {
          licences: [
            {
              type: LicenceType.AP,
              status: LicenceStatus.NOT_STARTED,
            },
          ],
          nomisRecord: {
            firstName: 'Bob',
            lastName: 'Smith',
            prisonerNumber: 'A1234AA',
            confirmedReleaseDate: '',
          } as Prisoner,
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
          nomisRecord: {
            firstName: 'Harvey',
            lastName: 'Smith',
            prisonerNumber: 'A1234AC',
            conditionalReleaseDate: null,
          } as Prisoner,
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
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: 'not found',
            releaseDateLabel: 'CRD',
            hardStop: false,
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
            hardStop: false,
          },
        ],

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
