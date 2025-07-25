import { Router, RequestHandler } from 'express'
import config from '../../config'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import fetchDprDefinitions from '../../middleware/fetchDprDefinitions'
import { Services } from '../../services'
import DprReportsRoutes from './handlers/dprReports'
import DprHomeRoutes from './handlers/dprHome'

export default function Index({ dprService }: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/reports${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD']),
      fetchDprDefinitions(dprService),
      handler,
    )
  const dprHomeHandler = new DprHomeRoutes()
  const dprReportsHandler = new DprReportsRoutes(dprService)

  if (config.dprReportingEnabled) {
    get('/', dprHomeHandler.GET)
    get('/:id', dprReportsHandler.GET)
  }

  return router
}
