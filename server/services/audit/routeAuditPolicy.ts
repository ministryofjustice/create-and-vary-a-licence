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

export type RouteAuditPolicy = {
  route: string
  policy: AuditPolicy
}

export default function getAuditPolicy(routePath: string): RouteAuditPolicy {
  const policyKey = Object.keys(routeAuditPolicy).find(routeKey => matchesRoute(routePath, routeKey))
  const policy = (routeAuditPolicy as Record<string, AuditPolicy>)[policyKey]
  if (!policy) {
    logger.error(`No audit policy found for route: ${routePath}`)
    return undefined
  }

  return {
    route: policyKey,
    policy: {
      ...policy,
      customHandler: policy.customHandler ?? false,
    },
  }
}

function matchesRoute(routePath: string, template: string): boolean {
  const checkMatch = match(template, { decode: decodeURIComponent })
  const result = checkMatch(routePath)
  return result !== false
}
