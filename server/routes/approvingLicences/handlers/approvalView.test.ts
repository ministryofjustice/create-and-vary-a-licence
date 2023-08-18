import { Request, Response } from 'express'

import ApprovalViewRoutes from './approvalView'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ConditionService from '../../../services/conditionService'
import CommunityService from '../../../services/communityService'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>

const username = 'joebloggs'
const displayName = 'Joe Bloggs'

jest.mock('../../../services/communityService')
jest.mock('../../../services/conditionService')

describe('Route - view and approve a licence', () => {
  const handler = new ApprovalViewRoutes(licenceService, conditionService, communityService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request

    licenceService.updateStatus = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  describe('GET', () => {
    communityService.getStaffDetailByUsername.mockResolvedValue({
      staffIdentifier: 3000,
      username: 'joebloggs',
      email: 'joebloggs@probation.gov.uk',
      telephoneNumber: '07777777777',
      staff: {
        forenames: 'Joe',
        surname: 'Bloggs',
      },
    })
    conditionService.additionalConditionsCollection.mockReturnValue({
      additionalConditions: [],
      conditionsWithUploads: [],
    })
    it('should check status is SUBMITTED else redirect to case list', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, displayName },
          licence: {
            id: 1,
            statusCode: LicenceStatus.APPROVED,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
            bespokeConditions: [],
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/cases')
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
      expect(conditionService.additionalConditionsCollection).not.toHaveBeenCalled()
      expect(communityService.getStaffDetailByUsername).not.toHaveBeenCalled()
    })

    it('should render a single licence view for approval', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, displayName },
          licence: {
            id: 1,
            statusCode: LicenceStatus.SUBMITTED,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
            bespokeConditions: [],
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/view', {
        additionalConditions: [],
        conditionsWithUploads: [],
        staffDetails: {
          email: 'joebloggs@probation.gov.uk',
          name: 'Joe Bloggs',
          telephone: '07777777777',
        },
        returnPath: encodeURIComponent(`/licence/approve/id/${res.locals.licence.id}/view`),
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(conditionService.additionalConditionsCollection).toHaveBeenCalled()
      expect(communityService.getStaffDetailByUsername).toHaveBeenCalled()
    })
  })

  describe('POST', () => {
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: { user: { username, displayName } },
    } as unknown as Response

    it('should approve a licence', async () => {
      req = {
        body: { licenceId: '1', result: 'approve' },
      } as unknown as Request

      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.APPROVED, res.locals.user)
      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/id/1/confirm-approved')
    })

    it('should reject a licence', async () => {
      req = {
        body: { licenceId: '1', result: 'reject' },
      } as unknown as Request

      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.REJECTED, res.locals.user)
      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/id/1/confirm-rejected')
    })
  })
})
