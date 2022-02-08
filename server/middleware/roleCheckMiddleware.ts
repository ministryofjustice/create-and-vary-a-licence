import { RequestHandler } from 'express'

/*
 ** This middleware function checks that access to a set of route handlers is allowed
 ** if the current user has one of the allowed roles.
 */
export default function roleCheckMiddleware(allowedRoles: string[]): RequestHandler {
  return async (req, res, next) => {
    const { userRoles } = res.locals.user
    if (userRoles) {
      const roleIntersection = allowedRoles.filter(role => userRoles.includes(role))
      if (roleIntersection.length > 0) {
        return next()
      }
    }
    return res.redirect('/access-denied')
  }
}
