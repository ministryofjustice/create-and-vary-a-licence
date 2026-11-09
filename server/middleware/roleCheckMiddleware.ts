import { RequestHandler } from 'express'
import AuditService from '../services/audit/auditService'

/*
 ** This middleware function checks that access to a set of route handlers is allowed
 ** if the current user has one of the allowed roles.
 */
export default function roleCheckMiddleware(auditService: AuditService, allowedRoles: string[]): RequestHandler {
  return async (req, res, next) => {
    const { user, licence } = res.locals
    const { userRoles } = user
    if (userRoles) {
      const roleIntersection = allowedRoles.filter(role => userRoles.includes(role))
      if (roleIntersection.length > 0) {
        return next()
      }
    }

    await auditService.logPageAccessFailure(req, licence, res.locals.user)
    return res.redirect('/access-denied')
  }
}
