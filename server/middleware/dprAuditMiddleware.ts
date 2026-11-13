import { Request, RequestHandler } from 'express'
import { match, MatchFunction, MatchResult, ParamData } from 'path-to-regexp'
import config from '../config'
import logger from '../../logger'
import AuditService from '../services/audit/auditService'

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

export default function dprAuditMiddleware(auditService: AuditService): RequestHandler {
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

    const toSnakeCase = (str: string): string => {
      return str.toUpperCase().replace(/-/g, '_')
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

  return async (req, res, next) => {
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
}
