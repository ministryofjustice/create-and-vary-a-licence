import routeAuditPolicy from './auditPolicyConfig.json'

export type AuditPolicy = {
  // Does the route need to be audited?
  audit: boolean

  // The audit event if the route is auditable
  event?: string

  // The reason why the route is not auditable, if applicable
  reason?: string

  // Set to true if the route is auditable but needs custom event data so will send the audit event itself
  customHandler?: boolean
}

export default function getAuditPolicy(key: string): AuditPolicy | undefined {
  const policyKey = Object.keys(routeAuditPolicy).find(routeKey => matchesRoute(key, routeKey))
  const policy = (routeAuditPolicy as Record<string, AuditPolicy>)[policyKey]
  if (policy) {
    return { ...policy, customHandler: policy.customHandler ?? false }
  }
  return undefined // TODO: REMOVE, this should never happen if the build passes as all routes will be defined.
}

function routeTemplateToRegex(template: string): RegExp {
  const escaped = template
    .split('/')
    .map(segment => (segment.startsWith(':') ? '[A-Za-z0-9]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/')
  return new RegExp(`^${escaped}$`)
}

function matchesRoute(input: string, template: string): boolean {
  return routeTemplateToRegex(template).test(input)
}
