import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import ProbationSearchRoutes from './handlers/probationSearch'
import { Services } from '../../services'

export default function Index({ searchService }: Services): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const probationSearchHandler = new ProbationSearchRoutes(searchService)

  get('/search/probation-search', probationSearchHandler.GET)

  return router
}
