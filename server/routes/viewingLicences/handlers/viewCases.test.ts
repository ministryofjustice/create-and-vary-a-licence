import { Request, Response } from 'express'

import ViewAndPrintCaseRoutes from './viewCases'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import PrisonerService from '../../../services/prisonerService'

import LicenceType from '../../../enumeration/licenceType'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'

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
      render: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
          activeCaseload: 'BAI',
          prisonCaseload: ['BAI'],
        },
      },
    } as unknown as Response

    caseloadService.getOmuCaseload.mockResolvedValue([
      {
        licences: [
          {
            id: 1,
            type: LicenceType.AP,
            status: LicenceStatus.SUBMITTED,
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
            status: LicenceStatus.NOT_STARTED,
          },
        ],
        nomisRecord: {
          firstName: 'Joe',
          lastName: 'Bloggs',
          prisonerNumber: 'A1234AB',
          conditionalReleaseOverrideDate: '2022-05-01',
        } as Prisoner,
        probationPractitioner: {
          name: 'Thor',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.NOT_IN_PILOT,
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
            status: LicenceStatus.OOS_RECALL,
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
            status: LicenceStatus.OOS_BOTUS,
          },
        ],
        nomisRecord: {
          firstName: 'Stephen',
          lastName: 'Rowe',
          prisonerNumber: 'A1234AE',
          conditionalReleaseDate: '2022-05-01',
        } as Prisoner,
        probationPractitioner: {
          name: 'Larry Johnson',
        },
      },
    ])

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

  describe('GET', () => {
    it('should render list of licences and display the currently active caseload prison', async () => {
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
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
          {
            licenceId: undefined,
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isClickable: false,
          },
          {
            licenceId: undefined,
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.NOT_IN_PILOT,
            isClickable: false,
          },
          {
            licenceId: undefined,
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.OOS_RECALL,
            isClickable: false,
          },
          {
            licenceId: undefined,
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.OOS_BOTUS,
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
        search: undefined,
        statusConfig,
      })
    })

    it('should render list of licences and display a single user selected prison which is not the currently active prison', async () => {
      req.session.caseloadsSelected = ['MDI']
      res.locals.user.prisonCaseload = ['BAI', 'MDI']
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
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
          {
            licenceId: undefined,
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isClickable: false,
          },
          {
            licenceId: undefined,
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.NOT_IN_PILOT,
            isClickable: false,
          },
          {
            licenceId: undefined,
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.OOS_RECALL,
            isClickable: false,
          },
          {
            licenceId: undefined,
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.OOS_BOTUS,
            isClickable: false,
          },
        ],
        hasMultipleCaseloadsInNomis: true,
        prisonsToDisplay: [
          {
            agencyId: 'MDI',
            description: 'Moorland (HMP)',
          },
        ],
        search: undefined,
        statusConfig,
      })
    })

    it('should render list of licences and display with multiple user selected prisons', async () => {
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
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
          {
            licenceId: undefined,
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isClickable: false,
          },
          {
            licenceId: undefined,
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.NOT_IN_PILOT,
            isClickable: false,
          },
          {
            licenceId: undefined,
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.OOS_RECALL,
            isClickable: false,
          },
          {
            licenceId: undefined,
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            licenceStatus: LicenceStatus.OOS_BOTUS,
            isClickable: false,
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
        search: undefined,
        statusConfig,
      })
    })

    it('should successfully search by name', async () => {
      req.query.search = 'bob'

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
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
        ],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: 'bob',
        statusConfig,
      })
    })

    it('should successfully search by prison number', async () => {
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
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
        ],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: 'A1234AA',
        statusConfig,
      })
    })

    it('should successfully search by probation practitioner', async () => {
      req.query.search = 'holmes'

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
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
        ],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: 'holmes',
        statusConfig,
      })
    })
  })
})
