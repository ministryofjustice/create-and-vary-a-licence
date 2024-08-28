import { jwtDecode } from 'jwt-decode'
import { Request, Response, NextFunction } from 'express'
import logger from '../../logger'
import AuthRole from '../enumeration/authRole'

const isAuthorisedRole = (role: string): boolean =>
  Object.values(AuthRole)
    .map(role => role as string)
    .includes(role)

export default function authorisationMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (res.locals?.user?.token) {
    let roles = res.locals.user?.userRoles
    if (!roles) {
      const { authorities: tokenRoles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
      roles = tokenRoles
    }

    if (!roles?.some(isAuthorisedRole)) {
      logger.warn(`User ${res.locals.user?.username} is not authorised with current roles: ${JSON.stringify(roles)}`)
      return res.redirect('/authError')
    }

    res.locals.user.userRoles = roles
    return next()
  }

  // No token is present so redirect to /login
  req.session.returnTo = req.originalUrl
  return res.redirect('/login')
}
