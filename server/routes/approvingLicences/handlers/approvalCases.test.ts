import { Request, Response } from 'express'

import ApprovalCaseRoutes from './approvalCases'
import PrisonerService from '../../../services/prisonerService'

import type { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import ApproverCaseloadService, { type ApprovalCase } from '../../../services/approverCaseloadService'
import { parseCvlDate } from '../../../utils/utils'

const caseloadService = new ApproverCaseloadService(null, null) as jest.Mocked<ApproverCaseloadService>
jest.mock('../../../services/approverCaseloadService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

const cases: ApprovalCase[] = [
  {
    licenceId: 1,
    name: 'Bob Smith',
    prisonerNumber: 'A1234AA',
    releaseDate: '01 May 2022',
    probationPractitioner: {
      name: 'Walter White',
    },
    submittedByFullName: 'John Smith',
    urgentApproval: false,
    isDueForEarlyRelease: false,
    sortDate: parseCvlDate('01/05/2022'),
    approvedBy: 'An Approver',
    approvedOn: '10 April 2023',
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
    isDueForEarlyRelease: true,
    sortDate: parseCvlDate('01/05/2022'),
    approvedBy: 'Bn Approver',
    approvedOn: '12 April 2023',
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

    caseloadService.getApprovalNeeded.mockResolvedValue(cases)
    caseloadService.getRecentlyApproved.mockResolvedValue(cases)

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
          cases,
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
    })

    describe('GET recently approved', () => {
      it('should render list of licences recently approved', async () => {
        req.query.approval = 'recently'
        await handler.GET(req, res)
        expect(caseloadService.getRecentlyApproved).toHaveBeenCalledWith(res.locals.user, ['BAI'], undefined)
        expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
          cases,
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
    })
  })
})
