import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import ChangeTeamsLocation from './handlers/changeTeam'
import { Services } from '../../services'

export default function Index({ conditionService, caseloadService }: Services): Router {
  const createPrefix = (path: string) => `/licence/create/caseload${path}`
  const varyPrefix = (path: string) => `/licence/vary/caseload${path}`

  const router = Router()
  const get = (path: string, handler: RequestHandler) =>
    router.get(path, roleCheckMiddleware(['ROLE_LICENCE_RO']), asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      path,
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )

  const teamHandler = new ChangeTeamsLocation(caseloadService)

  get(createPrefix('/change-team'), teamHandler.GET())
  get(varyPrefix('/change-team'), teamHandler.GET())

  post(createPrefix('/change-team'), teamHandler.POST())
  post(varyPrefix('/change-team'), teamHandler.POST())

  return router
}
