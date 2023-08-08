import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import ProbationSearchRoutes from './handlers/probationSearch'
import { Services } from '../../services'

export default function Index({ searchService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/search${path}`

  const get = (path: string, handler: RequestHandler) => router.get(routePrefix(path), asyncMiddleware(handler))

  // Handlers
  const probationSearchHandler = new ProbationSearchRoutes(searchService)

  // Operations
  get('/probation-search', probationSearchHandler.GET)

  return router
}
