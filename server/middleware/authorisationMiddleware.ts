import { jwtDecode } from 'jwt-decode'
import { RequestHandler } from 'express'
import logger from '../../logger'
import AuthRole from '../enumeration/authRole'
import AuditService from '../services/audit/auditService'

const isAuthorisedRole = (role: string): boolean =>
  Object.values(AuthRole)
    .map(role => role as string)
    .includes(role)

export default function authorisationMiddleware(auditService: AuditService): RequestHandler {
  return async (req, res, next) => {
    if (res.locals?.user?.token) {
      let roles = res.locals.user?.userRoles
      if (!roles) {
        const { authorities: tokenRoles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
        roles = tokenRoles
      }

      if (!roles?.some(isAuthorisedRole)) {
        logger.warn(`User ${res.locals.user?.username} is not authorised with current roles: ${JSON.stringify(roles)}`)
        await auditService.logPageAccessFailure(req, undefined, res.locals.user)
        return res.redirect('/authError')
      }

      res.locals.user.userRoles = roles
      return next()
    }

    // No token is present so redirect to /login
    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  }
}
