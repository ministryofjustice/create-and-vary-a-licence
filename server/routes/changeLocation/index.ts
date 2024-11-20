import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import ChangeLocationRoutes from './handlers/changeLocation'
import { Services } from '../../services'
import Caseload from './types/caseload'
import AuthRole from '../../enumeration/authRole'

export default function Index({ userService, conditionService }: Services): Router {
  const routePrefix = (path: string) => `/licence${path}`

  const router = Router()
  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_DM']), asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_DM']),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler),
    )
  const locationHandler = new ChangeLocationRoutes(userService)

  get('/approve/change-location', locationHandler.GET(AuthRole.DECISION_MAKER))
  post('/approve/change-location', locationHandler.POST(AuthRole.DECISION_MAKER), Caseload)

  get('/view/change-location', locationHandler.GET(AuthRole.CASE_ADMIN))
  post('/view/change-location', locationHandler.POST(AuthRole.CASE_ADMIN), Caseload)

  return router
}
