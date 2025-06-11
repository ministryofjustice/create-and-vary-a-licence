import { RequestHandler, Router } from 'express'
import ProbationSearchRoutes from './handlers/probationSearch'
import { Services } from '../../services'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import CaSearchRoutes from './handlers/caSearch'

export default function Index({ searchService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/search${path}`

  const get = (path: string, role: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware([role]), handler)

  // Handlers
  const probationSearchHandler = new ProbationSearchRoutes(searchService)
  const caSearchHandler = new CaSearchRoutes(searchService)

  // Operations
  get('/probation-search', 'ROLE_LICENCE_RO', probationSearchHandler.GET)
  get('/ca-search', 'ROLE_LICENCE_CA', caSearchHandler.GET)

  return router
}
