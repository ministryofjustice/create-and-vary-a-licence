import { Request, Response } from 'express'
import AuditService from '../services/audit/auditService'
import config from '../config'
import dprAuditMiddleware from './dprAuditMiddleware'

jest.mock('../services/audit/auditService')

const req = {
  id: 'request-id',
  baseUrl: '',
  method: 'GET',
  path: '/dpr/view-report/sync/report/active-licences/active-licences/load-report',
} as Request
const res = {
  locals: {
    user: {
      username: 'XX',
      nomisStaffId: 123,
      prisonCaseload: ['LEI', 'MDI'],
    },
  },
} as unknown as Response
const next = jest.fn()

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const middleware = dprAuditMiddleware(auditService)

beforeEach(() => {
  config.sqs.audit.enabled = true
  auditService.logPageViewAttempt.mockResolvedValue(undefined)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('dpAuditMiddleware', () => {
  it('should not call audit service if auditing is disabled', async () => {
    config.sqs.audit.enabled = false

    await middleware(req, res, next)

    expect(auditService.logReportView).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should not call audit service if the route does not require auditing', async () => {
    const noAuditNeededReq = {
      ...req,
      path: '/route/that/does/not/exist',
    } as Request

    await middleware(noAuditNeededReq, res, next)

    expect(auditService.logReportView).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should audit report routes', async () => {
    await middleware(req, res, next)

    expect(auditService.logReportView).toHaveBeenCalledWith(
      req.id,
      'VIEW_ACTIVE_LICENCES_REPORT_LOAD_REPORT_SUCCESS',
      res.locals.user,
    )
    expect(next).toHaveBeenCalledTimes(1)
  })
})
