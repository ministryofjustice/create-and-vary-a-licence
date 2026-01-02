import { Router, RequestHandler } from 'express'
import type { Environment } from 'nunjucks'
import { setupResources } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/middleware/setUpDprResources'
import { DprUser } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/types/DprUser'
import dprPlatformRoutes from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/routes'

import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import { Services } from '../../services'
import ReportHomeRoutes from './handlers'
import LastMinuteHandoverCasesRoutes from './handlers/lastMinuteHandoverCases'
import UpcomingReleasesWithMonitoringRoutes from './handlers/upcomingReleasesWithMonitoring'
import { getSystemToken } from '../../data/systemToken'

export default function Index(services: Services, nunjucksEnvironment: Environment): Router {
  const { licenceService } = services
  const router = Router()
  const routePrefix = (path: string) => `/reports${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD', 'ROLE_CVL_REPORTS']), handler)
  const reportHomeHandler = new ReportHomeRoutes()

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

  router.use(async (req, res) => {
    const { token } = await getSystemToken(req.user.username)
    const dprUser = new DprUser()
    dprUser.token = token
    dprUser.id = req.user.uuid
    dprUser.emailAddress = res.locals.user.emailAddress
    dprUser.displayName = res.locals.user.displayName
    res.locals.dprUser = dprUser
  })

  router.use(
    setupResources(services, 'aaa', nunjucksEnvironment, {
      routePrefix: '/reports',
      dataProductDefinitionsPath: '/reports/data-product-definitions.json',
    }),
  )
  router.use('/dpr', dprPlatformRoutes({ services, layoutPath: '/reports' }))

  return router
}
