import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import type { AuditEvent } from '../../../@types/licenceApiClientTypes'
import AuditDetailsRoutes from './auditDetails'
import { AuditEventIdParams, LicenceIdParams, NomsIdParams } from '../../types/routeParams'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/prisonerService')
jest.mock('../../../services/licenceService')

describe('Route Handlers - Audit details', () => {
  const handler = new AuditDetailsRoutes(licenceService)
  let req: Request<LicenceIdParams & NomsIdParams & AuditEventIdParams>
  let res: Response

  beforeEach(() => {
    res = {
      locals: {
        user: {},
      },
      render: jest.fn(),
    } as unknown as Response
    req = {} as Request<LicenceIdParams & NomsIdParams & AuditEventIdParams>
  })

  describe('GET', () => {
    it('Should render audit event details', async () => {
      req.params = {
        nomsId: 'A1234BC',
        licenceId: '1',
        auditEventId: '1',
      }

      const expectedAuditDetail = {
        id: 1,
        licenceId: 1,
        eventTime: '2022-06-01',
        username: 'dave_jones',
        fullName: 'Dave Jones',
        eventType: 'USER_EVENT',
        summary: 'Audit Summary 1',
        detail: 'ID 2 changed event data',
        changes: {
          type: 'Test',
          changes: [
            {
              type: 'Something',
              description: 'Something',
            },
          ],
        } as unknown as Record<string, unknown>,
      } as AuditEvent

      licenceService.getAuditEvents.mockResolvedValue([expectedAuditDetail])
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/support/auditDetails', {
        nomsId: req.params.nomsId,
        auditEvent: expectedAuditDetail,
      })
    })
  })
})
