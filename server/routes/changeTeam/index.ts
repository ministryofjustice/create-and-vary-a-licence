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

  const createTeamHandler = new ChangeTeamsLocation(caseloadService, 'create')
  get(createPrefix('/change-team'), createTeamHandler.GET())
  post(createPrefix('/change-team'), createTeamHandler.POST())

  const varyTeamHandler = new ChangeTeamsLocation(caseloadService, 'vary')
  get(varyPrefix('/change-team'), varyTeamHandler.GET())
  post(varyPrefix('/change-team'), varyTeamHandler.POST())

  return router
}
