import { Router, RequestHandler } from 'express'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import { Services } from '../../services'
import DprReportsRoutes from './handlers/dprReports'
import ReportHomeRoutes from './handlers'
import LastMinuteHandoverCasesRoutes from './handlers/lastMinuteHandoverCases'
import UpcomingReleasesWithMonitoringRoutes from './handlers/upcomingReleasesWithMonitoring'

export default function Index({ dprService, licenceService }: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/reports${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD', 'ROLE_CVL_REPORTS']), handler)
  const reportHomeHandler = new ReportHomeRoutes()
  const dprReportsHandler = new DprReportsRoutes(dprService)

  get('/', reportHomeHandler.GET)
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

  get('/:id', dprReportsHandler.GET)

  return router
}
