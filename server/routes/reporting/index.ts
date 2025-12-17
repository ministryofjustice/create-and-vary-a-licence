import { Router, RequestHandler } from 'express'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import { Services } from '../../services'
import DprReportsRoutes from './handlers/dprReports'
import DprHomeRoutes from './handlers/dprHome'

export default function Index({ dprService }: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/reports${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD', 'ROLE_CVL_REPORTS']), handler)
  const dprHomeHandler = new DprHomeRoutes()
  const dprReportsHandler = new DprReportsRoutes(dprService)

  get('/', dprHomeHandler.GET)
  get('/:id', dprReportsHandler.GET)

  return router
}
