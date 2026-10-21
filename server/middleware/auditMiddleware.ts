import { RequestHandler } from 'express'
import getAuditPolicy from '../services/audit/routeAuditPolicy'
import AuditService from '../services/audit/auditService'
import config from '../config'

/**
 * Middleware to check if a route is auditable and if so call the audit service to record the audit.
 */
export default function auditMiddleware(auditService: AuditService): RequestHandler {
  return async (req, res, next) => {
    if (config.hmppsAuditEnabled) {
      const path = `${req.method} ${req.baseUrl}${req.path}`
      const policy = getAuditPolicy(path)

      if (policy && policy.audit && !policy.customHandler) {
        const { user } = res.locals
        const { licence } = res.locals
        await auditService.logPageViewAttempt(req.id, policy, licence, user)
      }

      // TODO: do we want to add this to log views that complete successfully?
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
