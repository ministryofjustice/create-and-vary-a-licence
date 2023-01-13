import { Request, Response } from 'express'

import ViewAndPrintCaseRoutes from './viewCases'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import PrisonerService from '../../../services/prisonerService'
import LicenceService from '../../../services/licenceService'

import LicenceType from '../../../enumeration/licenceType'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import Container from '../../../services/container'
import OmuCaselist from '../../../services/omuCaselist'
import { Licence } from '../../../@types/licenceApiClientTypes'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
jest.mock('../../../services/caseloadService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

const licenceService = new LicenceService(null, prisonerService, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route handlers - View and print case list', () => {
  const handler = new ViewAndPrintCaseRoutes(caseloadService, prisonerService, licenceService)
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

    licenceService.getLicence.mockResolvedValue({
      id: 1,
      typeCode: 'AP',
      additionalLicenceConditions: [],
      additionalPssConditions: [],
      bespokeConditions: [],
      isVariation: false,
      conditionalReleaseDate: '2022-1-5',
      actualReleaseDate: '2022-1-3',
    }) as unknown as Licence
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    const caseList = new Container([
      {
        licences: [
          {
            id: 1,
            type: LicenceType.AP,
            status: LicenceStatus.NOT_STARTED,
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
            id: 2,
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
            id: 3,
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
            id: 4,
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
            id: 5,
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
            id: 6,
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
            id: 7,
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
            id: 8,
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
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isClickable: false,
            licenceId: 2,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 3,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 4,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
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
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isClickable: false,
            licenceId: 2,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 3,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 4,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
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
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isClickable: false,
            licenceId: 2,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 3,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 4,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
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
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isClickable: false,
            licenceId: 2,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 3,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 4,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
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
            licenceId: 5,
            licenceStatus: 'ACTIVE',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 Jul 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isClickable: false,
            licenceId: 6,
            licenceStatus: 'VARIATION_IN_PROGRESS',
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 Jun 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: false,
            licenceId: 7,
            licenceStatus: 'VARIATION_SUBMITTED',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: false,
            licenceId: 8,
            licenceStatus: 'VARIATION_APPROVED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
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
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
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
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isClickable: false,
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
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
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
            licenceId: 5,
            licenceStatus: 'ACTIVE',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 Jul 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isClickable: false,
            licenceId: 6,
            licenceStatus: 'VARIATION_IN_PROGRESS',
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 Jun 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: false,
            licenceId: 7,
            licenceStatus: 'VARIATION_SUBMITTED',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: false,
            licenceId: 8,
            licenceStatus: 'VARIATION_APPROVED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
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
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
          },
          {
            isClickable: false,
            licenceId: 2,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 3,
            licenceStatus: 'SUBMITTED',
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            isClickable: true,
            licenceId: 4,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            releaseDateLabel: 'CRD',
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
