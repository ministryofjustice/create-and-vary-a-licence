import { Request, Response } from 'express'

import { addDays, format } from 'date-fns'
import ApprovalCaseRoutes from './approvalCases'
import PrisonerService from '../../../services/prisonerService'

import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import ApproverCaseloadService from '../../../services/approverCaseloadService'

const caseloadService = new ApproverCaseloadService(null, null, null) as jest.Mocked<ApproverCaseloadService>
jest.mock('../../../services/approverCaseloadService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

const nonUrgentReleaseDate = addDays(new Date(), 10)

describe('Route Handlers - Approval - case list', () => {
  const handler = new ApprovalCaseRoutes(caseloadService, prisonerService)
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

    const caseLoadData = [
      {
        licences: [
          {
            id: 1,
            type: LicenceType.AP,
            status: LicenceStatus.SUBMITTED,
            submittedByFullName: 'John Smith',
          },
        ],
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          confirmedReleaseDate: '2022-05-01',
        } as Prisoner,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
      {
        licences: [
          {
            id: 2,
            type: LicenceType.AP,
            status: LicenceStatus.NOT_STARTED,
            submittedByFullName: 'John Smith',
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
            id: 3,
            type: LicenceType.AP,
            status: LicenceStatus.NOT_IN_PILOT,
            submittedByFullName: 'John Smith',
          },
        ],
        nomisRecord: {
          firstName: 'Harvey',
          lastName: 'Smith',
          prisonerNumber: 'A1234AC',
          conditionalReleaseDate: format(nonUrgentReleaseDate, 'yyyy-MM-dd'),
        } as Prisoner,
        probationPractitioner: {
          name: 'Walter Black',
        },
      },
    ]
    caseloadService.getApprovalNeeded.mockResolvedValue(caseLoadData)
    caseloadService.getRecentlyApproved.mockResolvedValue(caseLoadData)

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
    it('should render list of licences for approval', async () => {
      await handler.GET(req, res)
      expect(caseloadService.getApprovalNeeded).toHaveBeenCalledWith(res.locals.user, ['BAI'])
      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
            submittedByFullName: 'John Smith',
            urgentApproval: true,
          },
          {
            licenceId: 2,
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            submittedByFullName: 'John Smith',
            releaseDate: '01 May 2022',
            urgentApproval: true,
          },
          {
            licenceId: 3,
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter Black',
            },
            submittedByFullName: 'John Smith',
            releaseDate: format(nonUrgentReleaseDate, 'dd MMM yyyy'),
            urgentApproval: false,
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
        approvalNeededView: true,
      })
    })

    it('should render list of licences recently approved', async () => {
      caseloadService.getRecentlyApproved.mockResolvedValue([
        {
          licences: [
            {
              id: 1,
              type: LicenceType.AP,
              status: LicenceStatus.SUBMITTED,
              approvedBy: 'Bob Carolgees',
              approvedDate: '15/06/2012 12:34:56',
              submittedByFullName: 'Tim Smith',
            },
          ],
          nomisRecord: {
            firstName: 'Bob',
            lastName: 'Smith',
            prisonerNumber: 'A1234AA',
            confirmedReleaseDate: '2022-05-01',
          } as Prisoner,
          probationPractitioner: {
            name: 'Walter White',
          },
        },
        {
          licences: [
            {
              id: 2,
              type: LicenceType.AP,
              status: LicenceStatus.NOT_STARTED,
              approvedBy: 'Jim Robbins',
              approvedDate: '25/04/2012 10:45:12',
              submittedByFullName: 'Tim Smith',
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
      ])

      req.query.approval = 'recently'
      await handler.GET(req, res)
      expect(caseloadService.getRecentlyApproved).toHaveBeenCalledWith(res.locals.user, ['BAI'])
      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
            approvedBy: 'Bob Carolgees',
            approvedOn: '15 June 2012',
            submittedByFullName: 'Tim Smith',
            urgentApproval: true,
          },
          {
            licenceId: 2,
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            approvedBy: 'Jim Robbins',
            approvedOn: '25 April 2012',
            releaseDate: '01 May 2022',
            submittedByFullName: 'Tim Smith',
            urgentApproval: true,
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
        approvalNeededView: false,
      })
    })

    it('should successfully search by name', async () => {
      req.query.search = 'bob'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
            submittedByFullName: 'John Smith',
            urgentApproval: true,
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
        approvalNeededView: true,
      })
    })

    it('should successfully search by prison number', async () => {
      req.query.search = 'A1234AA'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
            submittedByFullName: 'John Smith',
            urgentApproval: true,
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
        approvalNeededView: true,
      })
    })

    it('should successfully search by probation practitioner', async () => {
      req.query.search = 'white'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
            submittedByFullName: 'John Smith',
            urgentApproval: true,
          },
        ],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: 'white',
        approvalNeededView: true,
      })
    })

    it('should return empty caseload if search does not match', async () => {
      req.query.search = 'XXX'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: 'XXX',
        approvalNeededView: true,
      })
    })
  })
})
