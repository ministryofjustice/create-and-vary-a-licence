import { match } from 'path-to-regexp'
import logger from '../../../logger'
import routeAuditPolicy from './auditPolicyConfig.json'

export type AuditPolicy = {
  // Does the route need to be audited?
  audit: boolean

  // The audit event if the route is auditable
  eventType?: string

  // The reason why the route is not auditable, if applicable
  reason?: string

  // Set to true if the route is auditable but needs custom event data so will send the audit event itself
  customHandler?: boolean
}

export default function getAuditPolicy(routePath: string): AuditPolicy {
  const policyKey = Object.keys(routeAuditPolicy).find(routeKey => matchesRoute(routePath, routeKey))
  const policy = (routeAuditPolicy as Record<string, AuditPolicy>)[policyKey]
  if (!policy) {
    logger.error(`No audit policy found for route: ${routePath}`)
    return policy
  }
  return { ...policy, customHandler: policy.customHandler ?? false }
}

function matchesRoute(routePath: string, template: string): boolean {
  const checkMatch = match(template, { decode: decodeURIComponent })
  const result = checkMatch(routePath)
  return result !== false
}
