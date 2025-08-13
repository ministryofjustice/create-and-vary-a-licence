import { RequestHandler, Router } from 'express'
import ProbationSearchRoutes from './handlers/probationSearch'
import { Services } from '../../services'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import CaSearchRoutes from './handlers/caSearch'
import ApproverSearchRoutes from './handlers/approverSearch'

export default function Index({ searchService, prisonerService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/search${path}`

  const get = (path: string, role: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware([role]), handler)

  // Handlers
  const probationSearchHandler = new ProbationSearchRoutes(searchService)
  const caSearchHandler = new CaSearchRoutes(searchService)
  const approverSearchHandler = new ApproverSearchRoutes(searchService, prisonerService)

  // Operations
  get('/probation-search', 'ROLE_LICENCE_RO', probationSearchHandler.GET)
  get('/ca-search', 'ROLE_LICENCE_CA', caSearchHandler.GET)
  get('/approver-search', 'ROLE_LICENCE_DM', approverSearchHandler.GET)

  return router
}
