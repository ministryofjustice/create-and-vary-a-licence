import express from 'express'
import nunjucks from 'nunjucks'
import { services } from '../services'
import setupRoutes from '../routes'
import { AuditPolicy, AuditRouteKey, routeAuditPolicy } from './routeAuditPolicy'
import setUpHealthChecks from '../middleware/setUpHealthChecks'
import applicationInfo from '../applicationInfo'
import setUpAuthentication from '../middleware/setUpAuthentication'
import logger from '../../logger'

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
 * Collect all middleware tags applied to routes.
 * Tags are stored as custom properties on middleware functions.
 */

// function collectAuditTags(layer: any, tags: Map<string, AuditRouteKey> = new Map()): Map<string, AuditRouteKey> {
//   // For route layers, inspect their middleware stack
//   if (layer.route && layer.route.stack) {
//     const routeKey = `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`
//
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     layer.route.stack.forEach((middleware: any) => {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       if (middleware.handle && (middleware.handle as any).__auditTag) {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         tags.set(routeKey, (middleware.handle as any).__auditTag)
//       }
//     })
//   }
//
//   // Recurse into nested routers
//   if (layer.name === 'router' && layer.handle.stack) {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     layer.handle.stack.forEach((sublayer: any) => {
//       collectAuditTags(sublayer, tags)
//     })
//   }
//
//   return tags
// }

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

    const missingPolicyEntries = allRoutes.filter(route => {
      return !excludedRoutes.has(route.key) && !routeAuditPolicy[route.key as AuditRouteKey]
    })

    logger.info(missingPolicyEntries.map(route => `${route.key}: { audit: true, event: ''}`))
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
        expect(policy.event).toBeDefined()
        expect(typeof policy.event).toBe('string')
        expect(policy.event.length).toBeGreaterThan(0)
      } else {
        expect(policy.reason).toBeDefined()
        expect(typeof policy.reason).toBe('string')
        expect(policy.reason.length).toBeGreaterThan(0)
      }
    })
  })
})
