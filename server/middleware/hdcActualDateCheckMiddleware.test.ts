import { Request, Response } from 'express'
import { HdcLicence, Licence } from '../@types/licenceApiClientTypes'
import LicenceKind from '../enumeration/LicenceKind'
import hdcActualDateCheckMiddleware from './hdcActualDateCheckMiddleware'
import logger from '../../logger'
import AuditService from '../services/audit/auditService'

let req: Request
let res: Response
const next = jest.fn()

jest.mock('../../logger')
jest.mock('../services/audit/auditService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>

const baseLicence = {
  id: 123,
  kind: LicenceKind.HDC,
} as Licence

beforeEach(() => {
  res = {
    redirect: jest.fn(),
    locals: {
      licence: { ...baseLicence },
    },
  } as unknown as Response

  jest.clearAllMocks()
})

describe('hdcActualDateCheckMiddleware', () => {
  it('should redirect when licence kind is HDC and homeDetentionCurfewActualDate is null', async () => {
    ;(res.locals.licence as HdcLicence).homeDetentionCurfewActualDate = null

    await hdcActualDateCheckMiddleware(auditService)(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(logger.error).toHaveBeenCalledWith(
      'Access denied: HDC licence missing homeDetentionCurfewActualDate (licenceId=123)',
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('should allow HDC when homeDetentionCurfewActualDate is present', async () => {
    ;(res.locals.licence as HdcLicence).homeDetentionCurfewActualDate = '2024-01-10'

    await hdcActualDateCheckMiddleware(auditService)(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should not block non-HDC licences regardless of date', async () => {
    res.locals.licence.kind = LicenceKind.CRD
    ;(res.locals.licence as HdcLicence).homeDetentionCurfewActualDate = '2024-01-10'

    await hdcActualDateCheckMiddleware(auditService)(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
