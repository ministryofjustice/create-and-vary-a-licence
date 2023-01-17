import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import ChangeTeamsLocation from './handlers/changeTeam'
import { Services } from '../../services'

export default function Index({ conditionService }: Services): Router {
  const routePrefix = (path: string) => `/licence/create/caseload${path}`

  const router = Router()
  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_RO']), asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )

  const teamHandler = new ChangeTeamsLocation()

  get('/change-team', teamHandler.GET())
  post('/change-team', teamHandler.POST())

  return router
}
