import { RequestHandler } from 'express'
import logger from '../../logger'

/*
 ** This middleware function checks that access to a set of route handlers is allowed
 ** if the current user has one of the allowed roles.
 */
export default function roleCheckMiddleware(allowedRoles: string[]): RequestHandler {
  return async (req, res, next) => {
    const { userRoles } = res.locals.user
    if (userRoles) {
      logger.info(`roleCheckMiddleware - required ${allowedRoles}, user has ${res.locals.user.userRoles}`)
      const roleIntersection = allowedRoles.filter(role => userRoles.includes(role))
      if (roleIntersection.length > 0) {
        logger.info(`roleCheckMiddleware - access allowed`)
        return next()
      }
    }
    logger.info(`roleCheckMiddleware - access denied. Redirect to access-denied.`)
    return res.redirect('/access-denied')
  }
}
