import jwt from 'jsonwebtoken'
import type { Request, Response } from 'express'
import authorisationMiddleware from './authorisationMiddleware'
import AuditService from '../services/audit/auditService'

function createToken(authorities: string[]) {
  const payload = {
    user_name: 'USER1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

jest.mock('../services/audit/auditService')
const auditService = new AuditService(null) as jest.Mocked<AuditService>

const middleware = authorisationMiddleware(auditService)

describe('authorisationMiddleware', () => {
  let req: Request
  const next = jest.fn()

  function createResWithToken({ authorities }: { authorities: string[] }): Response {
    return {
      locals: {
        user: {
          username: 'TEST',
          token: createToken(authorities),
        },
      },
      redirect: jest.fn(),
    } as unknown as Response
  }

  it('should redirect when no required roles', async () => {
    const res = createResWithToken({ authorities: [] })
    await middleware(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/authError')
    expect(auditService.logPageAccessFailure).toHaveBeenCalledWith(req, undefined, res.locals.user)
  })

  it('should redirect when user has no authorised roles', async () => {
    const res = createResWithToken({ authorities: ['NOT_IN_THE_LIST'] })
    await middleware(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/authError')
    expect(auditService.logPageAccessFailure).toHaveBeenCalledWith(req, undefined, res.locals.user)
  })

  it('should return next when user has authorised role', async () => {
    const res = createResWithToken({ authorities: ['ROLE_LICENCE_RO'] })
    await middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('should return next when user has the ACO role', async () => {
    const res = createResWithToken({ authorities: ['ROLE_LICENCE_ACO'] })
    await middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('should return next when user has a READONLY role', async () => {
    const res = createResWithToken({ authorities: ['ROLE_LICENCE_READONLY'] })
    await middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('should return next when user has the REPORTS role', async () => {
    const res = createResWithToken({ authorities: ['ROLE_CVL_REPORTS'] })
    await middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
