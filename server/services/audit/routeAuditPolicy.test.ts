import express from 'express'
import nunjucks from 'nunjucks'
import { services } from '../index'
import setupRoutes from '../../routes'
import setUpHealthChecks from '../../middleware/setUpHealthChecks'
import applicationInfo from '../../applicationInfo'
import setUpAuthentication from '../../middleware/setUpAuthentication'
import getAuditPolicy, { AuditPolicy } from './routeAuditPolicy'
import routeAuditPolicy from './auditPolicyConfig.json'

interface RouteEntry {
  method: string
  path: string
  key: string
}

/**
 * Recursively extract all routes from the app.
 * Handles nested routers, mount paths, regex patterns, and router.route(...).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRoutes(layer: any, prefix = '', routes: RouteEntry[] = []): RouteEntry[] {
  // Handle mount points (nested routers)
  if (layer.name === 'router' && layer.handle.stack) {
    const mountPath = layer.regexp ? prefix : prefix + (layer.prefix || '')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layer.handle.stack.forEach((sublayer: any) => {
      extractRoutes(sublayer, mountPath, routes)
    })
    return routes
  }

  // Handle individual route handlers
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase())
    const routePath = prefix + (layer.route.path || '')

    methods.forEach(method => {
      const key = `${method} ${routePath}`
      routes.push({
        method,
        path: routePath,
        key,
      })
    })

    return routes
  }

  return routes
}

/**
 * Routes to exclude from audit policy checks.
 * These are framework/system routes not managed by the audit policy.
 */
const excludedRoutes = new Set([
  'GET /*', // Frontend component fallback
])

describe('Route Audit Policy', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    const njkEnv = nunjucks.configure([])
    app.use(setUpHealthChecks(applicationInfo('test')))
    app.use(setUpAuthentication())
    app.use(setupRoutes(services, njkEnv))
  })

  it('every route must have an audit policy configured', () => {
    const allRoutes: RouteEntry[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.router.stack.forEach((layer: any) => {
      extractRoutes(layer, '', allRoutes)
    })

    // console.log(Object.keys(routeAuditPolicy).length)
    const missingPolicyEntries = allRoutes.filter(route => {
      return !excludedRoutes.has(route.key) && !Object.keys(routeAuditPolicy).find(routeKey => routeKey === route.key)
    })

    // missingPolicyEntries.forEach(route => console.log(`"${route.key}": { "audit": true, "event": ""}`))
    expect(missingPolicyEntries).toEqual([])
  })

  it('policy should not reference routes that do not exist', () => {
    const allRoutes = new Set<string>()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.router.stack.forEach((layer: any) => {
      const routes: RouteEntry[] = []
      extractRoutes(layer, '', routes)
      routes.forEach(r => allRoutes.add(r.key))
    })

    const orphanedPolicies = Object.keys(routeAuditPolicy).filter(
      policyKey => !allRoutes.has(policyKey) && !excludedRoutes.has(policyKey),
    )

    expect(orphanedPolicies).toEqual([])
  })

  it('should verify policy structure is valid', () => {
    Object.entries(routeAuditPolicy).forEach(([, policy]: [string, AuditPolicy]) => {
      if (policy.audit) {
        expect(policy.eventType).toBeDefined()
        expect(typeof policy.eventType).toBe('string')
        expect(policy.eventType.length).toBeGreaterThan(0)
      } else {
        expect(policy.reason).toBeDefined()
        expect(typeof policy.reason).toBe('string')
        expect(policy.reason.length).toBeGreaterThan(0)
      }
    })
  })

  it('policy config should not have duplicate keys', () => {
    const keys = Object.keys(routeAuditPolicy)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)
  })

  it('should match routes', () => {
    const validRoute = 'GET /licence/create/nomisId/ABC123/confirm'
    expect(getAuditPolicy(validRoute)).toBeDefined()

    const inValidRoute = 'GET /licence/create/nomisId/ABC123/confirmBad'
    expect(getAuditPolicy(inValidRoute)).not.toBeDefined()
  })
})
