import { RequestHandler } from 'express'
import { getAuditPolicy } from './routeAuditPolicy'
import AuditService from './auditService'

/**
 * Middleware to check if a route is auditable and if so call the audit service to record the audit.
 */
export default function auditMiddleware(auditService: AuditService): RequestHandler {
  return async (req, res, next) => {
    const path = `${req.method} ${req.baseUrl}${req.path}`
    const policy = getAuditPolicy(path)
    if (policy && policy.audit && !policy.customHandler) {
      const { user } = res.locals
      const { licence } = res.locals
      req.auditTag = path
      req.auditEvent = policy.event
      await auditService.recordAuditEvent(req.id, policy, licence, user)
    }
    next()
  }
}
