import { Request, Response } from 'express'

import ApprovalCaseRoutes from './approvalCases'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'

const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>
const prisonerService = new PrisonerService(null) as jest.Mocked<PrisonerService>
const username = 'joebloggs'

// TODO: Get the real prison caseload here - mocked from prison API
const prisonCaseload = ['MDI', 'LEI']

const fakeSummary = {
  licenceId: 1,
  licenceType: 'AP',
  surname: 'Smith',
  forename: 'Bob',
  nomisId: 'A1234AA',
  licenceStatus: LicenceStatus.SUBMITTED,
  prisonDescription: 'Moorland (HMP)',
  conditionalReleaseDate: '01/02/2022',
}

const fakeSummaryList = [fakeSummary] as LicenceSummary[]

const caseloadViewList = [
  {
    licenceId: fakeSummary.licenceId,
    licenceType: fakeSummary.licenceType,
    surname: fakeSummary.surname,
    forename: fakeSummary.forename,
    nomisId: fakeSummary.nomisId,
    status: fakeSummary.licenceStatus,
    prisonDescription: fakeSummary.prisonDescription,
    conditionalReleaseDate: fakeSummary.conditionalReleaseDate,
  },
]

describe('Route Handlers - Approval - case list', () => {
  const handler = new ApprovalCaseRoutes(licenceService, prisonerService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username,
        },
      },
    } as unknown as Response

    licenceService.getLicencesForApproval = jest.fn()
  })

  describe('GET', () => {
    it('should render list of licences for approval', async () => {
      licenceService.getLicencesForApproval.mockResolvedValue(fakeSummaryList)
      await handler.GET(req, res)
      expect(licenceService.getLicencesForApproval).toHaveBeenCalledWith(username, prisonCaseload)
      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', { cases: caseloadViewList })
    })
  })

  describe('POST', () => {
    it('should select a licence to view', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/id/1/view')
    })
  })
})
