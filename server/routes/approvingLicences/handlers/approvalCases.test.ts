import { Request, Response } from 'express'

import ApprovalCaseRoutes from './approvalCases'
import PrisonerService from '../../../services/prisonerService'

import type { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import ApproverCaseloadService from '../../../services/lists/approverCaseloadService'
import { ApprovalCase } from '../../../@types/licenceApiClientTypes'

const caseloadService = new ApproverCaseloadService(null) as jest.Mocked<ApproverCaseloadService>
jest.mock('../../../services/lists/approverCaseloadService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

const caseload: ApprovalCase[] = [
  {
    licenceId: 1,
    name: 'Bob Smith',
    prisonerNumber: 'A1234AA',
    releaseDate: '01/05/2022',
    probationPractitioner: {
      name: 'Com Four',
      allocated: true,
    },
    submittedByFullName: 'John Smith',
    urgentApproval: false,
    approvedBy: 'An Approver',
    approvedOn: '10/04/2023 00:00:00',
  },
  {
    licenceId: 2,
    name: 'Joe Bloggs',
    prisonerNumber: 'A1234AB',
    probationPractitioner: {
      name: 'Com Three',
      allocated: true,
    },
    submittedByFullName: 'John Smith',
    releaseDate: '01/05/2022',
    urgentApproval: true,
    approvedBy: 'Bn Approver',
    approvedOn: '12/04/2023 00:00:00',
  },
]

describe('Route Handlers - Approval - case list', () => {
  const handler = new ApprovalCaseRoutes(caseloadService, prisonerService)
  let req: Request
  let res: Response

  beforeEach(() => {
    jest.resetAllMocks()
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

    caseloadService.getApprovalNeeded.mockResolvedValue(caseload)
    caseloadService.getRecentlyApproved.mockResolvedValue(caseload)

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

  describe('GET', () => {
    describe('GET approval needed', () => {
      it('should render list of licences for approval', async () => {
        await handler.GET(req, res)
        expect(caseloadService.getApprovalNeeded).toHaveBeenCalledWith(res.locals.user, ['BAI'], undefined)
        expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
          cases: [
            {
              licenceId: 1,
              name: 'Bob Smith',
              prisonerNumber: 'A1234AA',
              releaseDate: '1 May 2022',
              probationPractitioner: {
                name: 'Com Four',
                allocated: true,
              },
              submittedByFullName: 'John Smith',
              urgentApproval: false,
              approvedBy: 'An Approver',
              approvedOn: '10 Apr 2023',
            },
            {
              licenceId: 2,
              name: 'Joe Bloggs',
              prisonerNumber: 'A1234AB',
              probationPractitioner: {
                name: 'Com Three',
                allocated: true,
              },
              submittedByFullName: 'John Smith',
              releaseDate: '1 May 2022',
              urgentApproval: true,
              approvedBy: 'Bn Approver',
              approvedOn: '12 Apr 2023',
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

      it('search term is formatted and passed to service layer', async () => {
        req.query.search = '  SomE SEArch Term '

        await handler.GET(req, res)
        expect(caseloadService.getApprovalNeeded).toHaveBeenCalledWith(res.locals.user, ['BAI'], 'some search term')
      })

      it('should render not found where release date is null', async () => {
        const caseload: ApprovalCase[] = [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: null,
            probationPractitioner: {
              name: 'Com Four',
              allocated: true,
            },
            submittedByFullName: 'John Smith',
            urgentApproval: false,
            approvedBy: null,
            approvedOn: null,
          },
        ]
        caseloadService.getApprovalNeeded.mockResolvedValue(caseload)
        await handler.GET(req, res)
        expect(caseloadService.getApprovalNeeded).toHaveBeenCalledWith(res.locals.user, ['BAI'], undefined)
        expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
          cases: [
            {
              approvedBy: null,
              approvedOn: null,
              licenceId: 1,
              name: 'Bob Smith',
              prisonerNumber: 'A1234AA',
              probationPractitioner: {
                name: 'Com Four',
                allocated: true,
              },
              releaseDate: 'not found',
              submittedByFullName: 'John Smith',
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
    })

    describe('GET recently approved', () => {
      it('should render list of licences recently approved', async () => {
        req.query.approval = 'recently'
        await handler.GET(req, res)
        expect(caseloadService.getRecentlyApproved).toHaveBeenCalledWith(res.locals.user, ['BAI'], undefined)
        expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
          cases: [
            {
              licenceId: 1,
              name: 'Bob Smith',
              prisonerNumber: 'A1234AA',
              releaseDate: '1 May 2022',
              probationPractitioner: {
                name: 'Com Four',
                allocated: true,
              },
              submittedByFullName: 'John Smith',
              urgentApproval: false,
              approvedBy: 'An Approver',
              approvedOn: '10 Apr 2023',
            },
            {
              licenceId: 2,
              name: 'Joe Bloggs',
              prisonerNumber: 'A1234AB',
              probationPractitioner: {
                name: 'Com Three',
                allocated: true,
              },
              submittedByFullName: 'John Smith',
              releaseDate: '1 May 2022',
              urgentApproval: true,
              approvedBy: 'Bn Approver',
              approvedOn: '12 Apr 2023',
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

      it('search term is formatted and passed to service layer', async () => {
        req.query.approval = 'recently'
        req.query.search = '  SomE SEArch Term '

        await handler.GET(req, res)
        expect(caseloadService.getRecentlyApproved).toHaveBeenCalledWith(res.locals.user, ['BAI'], 'some search term')
      })

      it('should render null where approved date is not set', async () => {
        req = {
          query: {
            approval: 'recently',
          },
          session: { caseloadsSelected: [] },
        } as unknown as Request
        const caseload: ApprovalCase[] = [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: null,
            probationPractitioner: {
              name: 'Com Four',
              allocated: true,
            },
            submittedByFullName: 'John Smith',
            urgentApproval: false,
            approvedBy: null,
            approvedOn: null,
          },
        ]
        caseloadService.getRecentlyApproved.mockResolvedValue(caseload)
        await handler.GET(req, res)
        expect(caseloadService.getRecentlyApproved).toHaveBeenCalledWith(res.locals.user, ['BAI'], undefined)
        expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
          cases: [
            {
              approvedBy: null,
              approvedOn: null,
              licenceId: 1,
              name: 'Bob Smith',
              prisonerNumber: 'A1234AA',
              probationPractitioner: {
                name: 'Com Four',
                allocated: true,
              },
              releaseDate: 'not found',
              submittedByFullName: 'John Smith',
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
          approvalNeededView: false,
        })
      })
    })
  })
})
