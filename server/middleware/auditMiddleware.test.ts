import { Request, Response } from 'express'
import auditMiddleware from './auditMiddleware'
import AuditService from '../services/audit/auditService'
import config from '../config'
import { Licence } from '../@types/licenceApiClientTypes'

jest.mock('../services/audit/auditService')

let res = {} as unknown as Response
const req = {
  id: 'request-id',
  baseUrl: '',
  method: 'GET',
  path: '/licence/create/id/1/check-your-answers',
} as Request
const next = jest.fn()

const prisonRes = {
  locals: {
    user: {
      username: 'XX',
      nomisStaffId: 123,
      prisonCaseload: ['LEI', 'MDI'],
    },
    licence: undefined,
  },
  redirect: jest.fn(),
} as unknown as Response
const auditService = new AuditService(null) as jest.Mocked<AuditService>

const middleware = auditMiddleware(auditService)

beforeEach(() => {
  req.params = { licenceId: '1' }
  res = prisonRes
  res.locals.licence = undefined
  auditService.logPageViewAttempt.mockResolvedValue(undefined)
  config.hmppsAuditEnabled = true
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('auditMiddleware', () => {
  it('should not call audit service is auditing is disabled', async () => {
    config.hmppsAuditEnabled = false
    req.params = {}

    await middleware(req, res, next)

    expect(auditService.logPageViewAttempt).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should not call audit service if the route does not require auditing', async () => {
    const noAuditNeededReq = {
      ...req,
      path: '/contact',
    } as Request

    await middleware(noAuditNeededReq, res, next)

    expect(auditService.logPageViewAttempt).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should call audit service if the route requires auditing', async () => {
    const crn = 'X123456'
    res.locals.licence = {
      id: 1,
      crn,
    } as Licence
    const noAuditNeededReq = {
      ...req,
      path: `/${crn}/restricted`,
    } as Request

    await middleware(noAuditNeededReq, res, next)

    expect(auditService.logPageViewAttempt).toHaveBeenCalledWith(
      req.id,
      {
        audit: true,
        eventType: 'RESTRICTED_OFFENDER_DETAILS_SUCCESS',
        customHandler: false,
      },
      res.locals.licence,
      res.locals.user,
    )
    expect(next).toHaveBeenCalledTimes(1)
  })
})
