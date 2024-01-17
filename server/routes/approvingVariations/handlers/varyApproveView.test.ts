import { Request, Response } from 'express'

import VaryApproveViewRoutes from './varyApproveView'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { VariedConditions } from '../../../utils/licenceComparator'
import ApprovalComment from '../../../@types/ApprovalComment'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

const username = 'joebloggs'
const displayName = 'Joe Bloggs'

describe('Route - view and approve a licence variation', () => {
  const handler = new VaryApproveViewRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request

    licenceService.approveVariation = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
    licenceService.getApprovalConversation = jest.fn()
    licenceService.compareVariationToOriginal = jest.fn()
  })

  describe('GET', () => {
    it('should render a single licence for variation approval', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, displayName },
          licence: {
            id: 1,
            licenceType: 'AP',
            statusCode: LicenceStatus.VARIATION_SUBMITTED,
            surname: 'Bobson',
            forename: 'Bob',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
            bespokeConditions: [],
          },
        },
      } as unknown as Response

      licenceService.compareVariationToOriginal.mockResolvedValue({
        licenceConditionsAdded: [],
      } as VariedConditions)

      licenceService.getApprovalConversation.mockResolvedValue([
        { who: 'X', when: '12/02/2022 11:05:00', comment: 'Reason', role: 'COM' },
        { who: 'Y', when: '13/02/2022 10:00:00', comment: 'Reason', role: 'APPROVER' },
      ] as ApprovalComment[])

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary-approve/view', {
        conversation: [
          { who: 'X', when: '12/02/2022 11:05:00', comment: 'Reason', role: 'COM' },
          { who: 'Y', when: '13/02/2022 10:00:00', comment: 'Reason', role: 'APPROVER' },
        ],
        conditionComparison: {
          licenceConditionsAdded: [],
        },
      })

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
    })

    it('should redirect to the variation approval list if not in status VARIATION_SUBMITTED', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username, displayName },
          licence: {
            id: 1,
            licenceType: 'AP',
            statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
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

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary-approve/list')
      expect(licenceService.getApprovalConversation).not.toHaveBeenCalled()
      expect(licenceService.compareVariationToOriginal).not.toHaveBeenCalled()
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })
  })

  describe('POST', () => {
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: { user: { username, displayName } },
    } as unknown as Response

    it('should approve a licence variation', async () => {
      req = {
        params: { licenceId: '1' },
      } as unknown as Request

      await handler.POST(req, res)

      expect(licenceService.approveVariation).toHaveBeenCalledWith('1', res.locals.user)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary-approve/id/1/approve')
    })
  })
})
