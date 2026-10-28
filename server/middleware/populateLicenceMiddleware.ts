import { RequestHandler } from 'express'
import { match, MatchFunction, MatchResult, ParamData } from 'path-to-regexp'
import getAuditPolicy from '../services/audit/routeAuditPolicy'
import LicenceService from '../services/licenceService'
import logger from '../../logger'

/**
 * Middleware to check if a route is auditable and if so call the audit service to record the audit.
 */
export default function populateLicenceMiddleware(licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    const path = `${req.method} ${req.baseUrl}${req.path}`
    const routePolicy = getAuditPolicy(path)
    if (routePolicy && routePolicy.policy) {
      const { policy } = routePolicy
      if (policy) {
        const { user } = res.locals
        const getRouteMatch: MatchFunction<ParamData> = match(routePolicy.route, { decode: decodeURIComponent })
        const result: MatchResult<ParamData> | false = getRouteMatch(path)
        if (result) {
          const { licenceId } = result.params
          if (licenceId) {
            res.locals.licence = await licenceService.getLicence(parseInt(licenceId as string, 10), user)
          }
        }
      }
    } else {
      logger.error(`No route policy found for path ${path}`)
    }

    next()
  }
}
