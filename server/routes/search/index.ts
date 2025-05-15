import { RequestHandler, Router } from 'express'
import ProbationSearchRoutes from './handlers/probationSearch'
import { Services } from '../../services'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

export default function Index({ searchService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/search${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_RO']), handler)

  // Handlers
  const probationSearchHandler = new ProbationSearchRoutes(searchService)

  // Operations
  get('/probation-search', probationSearchHandler.GET)

  return router
}
