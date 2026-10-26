import { RequestHandler } from 'express'
import { match, MatchFunction, MatchResult, ParamData } from 'path-to-regexp'
import getAuditPolicy from '../services/audit/routeAuditPolicy'
import AuditService from '../services/audit/auditService'
import config from '../config'
import LicenceService from '../services/licenceService'

/**
 * Middleware to check if a route is auditable and if so call the audit service to record the audit.
 */
export default function auditMiddleware(auditService: AuditService, licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    if (config.auditEnabled) {
      const path = `${req.method} ${req.baseUrl}${req.path}`
      const routePolicy = getAuditPolicy(path)

      const { policy } = routePolicy
      if (policy && policy.audit && !policy.customHandler) {
        const { user } = res.locals

        let { licence } = res.locals
        if (!licence) {
          const getRouteMatch: MatchFunction<ParamData> = match(routePolicy.route, { decode: decodeURIComponent })
          const result: MatchResult<ParamData> | false = getRouteMatch(path)
          if (result) {
            const { licenceId } = result.params
            if (licenceId) {
              licence = await licenceService.getLicence(parseInt(licenceId as string, 10), user)
              res.locals.licence = licence
            }
          }
        }
        await auditService.logPageViewAttempt(req.id, routePolicy.policy, licence, user)
      }

      // TODO: do we want to add this to log views that complete successfully as well as attempts?
      // if (policy && policy.audit) {
      //   res.prependOnceListener('finish', () => {
      //     if (res.statusCode === 200) {
      //       auditService.logPageViewSuccess(page, auditDetails)
      //     }
      //   })
      // }
    }
    next()
  }
}
