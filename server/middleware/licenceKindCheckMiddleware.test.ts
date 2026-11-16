import { Request, Response } from 'express'
import { Licence } from '../@types/licenceApiClientTypes'
import LicenceKind from '../enumeration/LicenceKind'
import licenceKindCheckMiddleware from './licenceKindCheckMiddleware'
import logger from '../../logger'
import AuditService from '../services/audit/auditService'

let req: Request
let res: Response
const next = jest.fn()

jest.mock('../../logger')
jest.mock('../services/audit/auditService')

const licence = {
  kind: LicenceKind.VARIATION,
} as Licence

beforeEach(() => {
  res = {
    redirect: jest.fn(),
    locals: {
      licence,
    },
  } as unknown as Response
})

const auditService = new AuditService(null) as jest.Mocked<AuditService>

describe('licenceKindCheckMiddleware', () => {
  it('should redirect licences with the supplied kind to access-denied', async () => {
    await licenceKindCheckMiddleware(auditService, [LicenceKind.VARIATION])(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(logger.error).toHaveBeenCalledWith('Access denied due to licence kind middleware, blocking kind: VARIATION')
    expect(next).not.toHaveBeenCalled()
  })

  it('should not redirect licences with a different kind to the one supplied', async () => {
    await licenceKindCheckMiddleware(auditService, [LicenceKind.CRD])(req, res, next)
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
