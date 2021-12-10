import { Request, Response } from 'express'

import ApprovalCaseRoutes from './approvalCases'
import LicenceService from '../../../services/licenceService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const username = 'joebloggs'
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

describe('Route Handlers - Approval - case list', () => {
  const handler = new ApprovalCaseRoutes(licenceService)
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
          prisonCaseload: ['MDI', 'LEI', 'BMI'],
        },
      },
    } as unknown as Response

    licenceService.getLicencesForApproval = jest.fn()
  })

  describe('GET', () => {
    it('should render list of licences for approval', async () => {
      licenceService.getLicencesForApproval.mockResolvedValue(fakeSummaryList)
      await handler.GET(req, res)
      expect(licenceService.getLicencesForApproval).toHaveBeenCalledWith(res.locals.user)
      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', { cases: fakeSummaryList })
    })
  })

  describe('POST', () => {
    it('should select a licence to view', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/id/1/view')
    })
  })
})
