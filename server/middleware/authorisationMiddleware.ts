import jwtDecode from 'jwt-decode'
import { Request, Response, NextFunction } from 'express'
import logger from '../../logger'

export enum AuthRole {
  OMU = 'ROLE_CVL_OMU',
  GLOBAL_SEARCH = 'ROLE_GLOBAL_SEARCH',
}

export const isAuthorisedRole = (role: string): boolean =>
  Object.keys(AuthRole)
    .map(key => AuthRole[key])
    .includes(role)

export default function authorisationMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (res.locals && res.locals.user && res.locals.user.token) {
    const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
    logger.info(`User roles: ${JSON.stringify(roles)}, Allowed roles: ${JSON.stringify(AuthRole)}`)

    if (!roles?.some(isAuthorisedRole)) {
      logger.error('User is not authorised to access this service')
      return res.redirect('/authError')
    }

    logger.info(`User is allowed in`)

    res.locals.user.userRoles = roles

    return next()
  }
  req.session.returnTo = req.originalUrl
  return res.redirect('/login')
}
