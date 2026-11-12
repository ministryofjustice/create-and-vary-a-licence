import { Request, RequestHandler, Router } from 'express'
import type { Environment } from 'nunjucks'
import {
  DprUser,
  routes as dprPlatformRoutes,
  setUpDprResources,
} from '@ministryofjustice/hmpps-digital-prison-reporting-frontend'

import { match, MatchFunction, MatchResult, ParamData } from 'path-to-regexp'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import { Services } from '../../services'
import ReportHomeRoutes from './handlers'
import LastMinuteHandoverCasesRoutes from './handlers/lastMinuteHandoverCases'
import UpcomingReleasesWithMonitoringRoutes from './handlers/upcomingReleasesWithMonitoring'
import RecentReleasesWithMonitoringRoutes from './handlers/recentReleasesWithMonitoring'
import LicenceStatusCasesRoutes from './handlers/licenceStatusCases'
import { getSystemToken } from '../../data/systemToken'
import config from '../../config'
import logger from '../../../logger'

enum ReportAction {
  VIEW_REPORT = 'VIEW_REPORT',
  APPLY_COLUMNS = 'APPLY_COLUMNS',
  RESET_COLUMNS = 'RESET_COLUMNS',
  DOWNLOAD = 'DOWNLOAD',
  SAVE_DEFAULTS = 'SAVE_DEFAULTS',
  DELETE_DEFAULTS = 'DELETE_DEFAULTS',
  RESET_FILTERS = 'RESET_FILTERS',
  LOAD_REPORT = 'LOAD_REPORT',
}

const reportAuditConfig: { [key: string]: ReportAction } = {
  '/dpr/view-report/sync/report/:reportName1/:reportName2/load-report': ReportAction.LOAD_REPORT,
  '/dpr/view-report/sync/report/:reportName1/:reportName2/report': ReportAction.VIEW_REPORT,
  '/dpr/view-report/sync/report/:reportName1/:reportName2/report/apply-columns': ReportAction.APPLY_COLUMNS,
  '/dpr/view-report/sync/report/:reportName1/:reportName2/report/reset-columns': ReportAction.RESET_COLUMNS,
  '/dpr/download-report/:reportName1/:reportName2': ReportAction.DOWNLOAD,
  '/dpr/view-report/sync/report/:reportName1/:reportName2/report/save-defaults': ReportAction.SAVE_DEFAULTS,
  '/dpr/view-report/sync/report/:reportName1/:reportName2/report/delete-defaults': ReportAction.DELETE_DEFAULTS,
  '/dpr/view-report/sync/report/:reportName1/:reportName2/report/reset-filters': ReportAction.RESET_FILTERS,
}

export default function Index(services: Services, nunjucksEnvironment: Environment): Router {
  const { auditService, licenceService } = services
  const router = Router()
  const routePrefix = (path: string) => `/reports${path}`

  const get = (path: string, ...handlers: RequestHandler[]) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(auditService, ['ROLE_NOMIS_BATCHLOAD', 'ROLE_CVL_REPORTS']),
      ...handlers,
    )

  {
    const routes = new LastMinuteHandoverCasesRoutes(licenceService)
    get('/last-minute-handover-cases', routes.GET)
    get('/last-minute-handover-cases/download-csv', routes.GET_CSV)
  }

  {
    const routes = new UpcomingReleasesWithMonitoringRoutes(licenceService)
    get('/upcoming-releases-with-monitoring', routes.GET)
    get('/upcoming-releases-with-monitoring/download-csv', routes.GET_CSV)
  }

  {
    const routes = new RecentReleasesWithMonitoringRoutes(licenceService)
    get('/recent-releases-with-monitoring', routes.GET)
    get('/recent-releases-with-monitoring/download-csv', routes.GET_CSV)
  }

  {
    const routes = new LicenceStatusCasesRoutes(licenceService)
    get('/licence-status-cases', routes.GET)
    get('/licence-status-cases/download-csv', routes.GET_CSV)
  }

  const dprUserMiddleware: RequestHandler = async (req, res, next) => {
    const { token } = await getSystemToken(req.user.username)
    const dprUser = new DprUser()
    dprUser.token = token
    dprUser.id = res.locals.user.reportUserId
    dprUser.emailAddress = res.locals.user.emailAddress
    dprUser.displayName = res.locals.user.displayName
    res.locals.dprUser = dprUser
    return next()
  }

  const giveDownloadPermissionsMiddleware: RequestHandler = async (req, res, next): Promise<void> => {
    const { dprUser } = res.locals
    for (const report of res.locals.definitions ?? []) {
      const variants = report.variants?.map(variants => variants.id) ?? []
      for (const variant of variants) {
        // eslint-disable-next-line no-await-in-loop
        await services.dprServices.downloadPermissionService.saveDownloadPermissionData(dprUser.id, report.id, variant)
      }
    }
    return next()
  }

  const toSnakeCase = (str: string): string => {
    return str.toUpperCase().replace(/-/g, '_')
  }

  const matchesRoute = (routePath: string, template: string): boolean => {
    const checkMatch = match(template, { decode: decodeURIComponent })
    const result = checkMatch(routePath)
    return result !== false
  }

  const findAuditEvent = (req: Request): string => {
    const path = `${req.baseUrl}${req.path}`
    const route = Object.keys(reportAuditConfig).find(route => matchesRoute(path, route))
    if (!route) {
      logger.error(`No audit policy found for route: ${path}`)
      return undefined
    }

    const getRouteMatch: MatchFunction<ParamData> = match(route, { decode: decodeURIComponent })
    const result: MatchResult<ParamData> | false = getRouteMatch(path)
    if (!result) {
      logger.error(`Could not find DPR report name in route: ${path}`)
    }

    const { reportName1 } = (result as MatchResult<ParamData>).params
    const auditType = reportAuditConfig[route]
    switch (auditType) {
      case ReportAction.VIEW_REPORT:
        return `VIEW_${toSnakeCase(reportName1 as string)}_REPORT_SUCCESS`
      case ReportAction.APPLY_COLUMNS:
        return `EDIT_${toSnakeCase(reportName1 as string)}_REPORT_APPLY_COLUMNS_SUCCESS`
      case ReportAction.RESET_COLUMNS:
        return `EDIT_${toSnakeCase(reportName1 as string)}_REPORT_RESET_COLUMNS_SUCCESS`
      case ReportAction.DOWNLOAD:
        return `VIEW_${toSnakeCase(reportName1 as string)}_REPORT_DOWNLOAD_SUCCESS`
      case ReportAction.SAVE_DEFAULTS:
        return `EDIT_${toSnakeCase(reportName1 as string)}_REPORT_SAVE_DEFAULTS_SUCCESS`
      case ReportAction.DELETE_DEFAULTS:
        return `EDIT_${toSnakeCase(reportName1 as string)}_REPORT_DELETE_DEFAULTS_SUCCESS`
      case ReportAction.RESET_FILTERS:
        return `EDIT_${toSnakeCase(reportName1 as string)}_REPORT_RESET_FILTERS_SUCCESS`
      case ReportAction.LOAD_REPORT:
        return `VIEW_${toSnakeCase(reportName1 as string)}_REPORT_LOAD_REPORT_SUCCESS`
      default:
        logger.error(`Could not find audit type for DPR route: ${req.path}`)
        return null
    }
  }

  const dprAuditMiddleware: RequestHandler = async (req, res, next) => {
    if (config.sqs.audit.enabled) {
      const auditEvent = findAuditEvent(req)
      if (auditEvent) {
        const { user } = res.locals
        await auditService.logReportView(req.id, auditEvent, user)
      } else {
        logger.error(`No audit config found for DPR route: ${req.path}`)
      }
    }
    return next()
  }

  const cwd = process.cwd()
  const layoutPath = `${cwd}/dist/server/views/layout.njk`

  const dprResourcesMiddleware = setUpDprResources(services.dprServices, layoutPath, nunjucksEnvironment)

  const reportHomeHandler = new ReportHomeRoutes()
  get('/', dprUserMiddleware, dprResourcesMiddleware, reportHomeHandler.GET)

  router.use('/dpr', dprUserMiddleware, dprResourcesMiddleware, dprAuditMiddleware, giveDownloadPermissionsMiddleware)
  router.use('/', dprPlatformRoutes({ services: services.dprServices, layoutPath }))

  return router
}
