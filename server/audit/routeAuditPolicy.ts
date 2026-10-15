import { AuditPolicy, AuditRouteKey, routeAuditPolicy } from './routeAuditPolicyConfig'

export default function getAuditPolicy(key: AuditRouteKey): AuditPolicy | undefined {
  const policyKey = Object.keys(routeAuditPolicy).find(routeKey => matchesRoute(key, routeKey))
  const policy = routeAuditPolicy[policyKey]
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
