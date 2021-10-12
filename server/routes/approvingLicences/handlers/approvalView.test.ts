import { Request, Response } from 'express'

import ApprovalViewRoutes from './approvalView'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'

const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>
const username = 'joebloggs'

describe('Route - view and approve a licence', () => {
  const handler = new ApprovalViewRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request

    licenceService.updateStatus = jest.fn()
  })

  describe('GET', () => {
    it('should render a single licence view for approval', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            statusCode: LicenceStatus.SUBMITTED,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/view')
    })

    it('should check status is SUBMITTED else redirect to case list', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            statusCode: LicenceStatus.APPROVED,
            surname: 'Bobson',
            forename: 'Bob',
            appointmentTime: '12/12/2022 14:16',
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/cases')
    })
  })

  describe('POST', () => {
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: { user: { username } },
    } as unknown as Response

    it('should approve a licence', async () => {
      req = {
        body: { licenceId: '1', result: 'approve' },
      } as unknown as Request

      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.APPROVED, username)
      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/id/1/confirm-approved')
    })

    it('should reject a licence', async () => {
      req = {
        body: { licenceId: '1', result: 'reject' },
      } as unknown as Request

      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.REJECTED, username)
      expect(res.redirect).toHaveBeenCalledWith('/licence/approve/id/1/confirm-rejected')
    })
  })
})
