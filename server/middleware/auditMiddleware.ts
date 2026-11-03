import { RequestHandler } from 'express'
import getAuditPolicy from '../services/audit/routeAuditPolicy'
import AuditService from '../services/audit/auditService'
import config from '../config'
import logger from '../../logger'

/**
 * Middleware to check if a route is auditable and if so call the audit service to record the audit.
 */
export default function auditMiddleware(auditService: AuditService): RequestHandler {
  return async (req, res, next) => {
    if (config.sqs.audit.enabled) {
      const path = `${req.method} ${req.baseUrl}${req.path}`
      const routePolicy = getAuditPolicy(path)
      if (!routePolicy?.policy) {
        logger.error(`No audit policy found for route: ${path}`)
      } else {
        const { policy } = routePolicy
        const { licence, user } = res.locals
        if (policy?.audit && !policy.customHandler) {
          await auditService.logPageViewAttempt(req.id, routePolicy.policy, licence, user)
        }
      }
    }
    next()
  }
}
