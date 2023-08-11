import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import ProbationSearchRoutes from './handlers/probationSearch'
import { Services } from '../../services'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'

export default function Index({ searchService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/search${path}`

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_RO']), asyncMiddleware(handler))

  // Handlers
  const probationSearchHandler = new ProbationSearchRoutes(searchService)

  // Operations
  post('/probation-search', probationSearchHandler.POST)

  return router
}
