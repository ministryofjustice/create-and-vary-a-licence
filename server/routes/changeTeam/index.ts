import { RequestHandler, Router } from 'express'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import ChangeTeamsLocation from './handlers/changeTeam'
import { Services } from '../../services'

export default function Index({ conditionService, comCaseloadService }: Services): Router {
  const createPrefix = (path: string) => `/licence/create/caseload${path}`
  const varyPrefix = (path: string) => `/licence/vary/caseload${path}`

  const router = Router()
  const get = (path: string, handler: RequestHandler) =>
    router.get(path, roleCheckMiddleware(['ROLE_LICENCE_RO']), handler)

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(path, roleCheckMiddleware(['ROLE_LICENCE_RO']), validationMiddleware(conditionService, type), handler)

  const createTeamHandler = new ChangeTeamsLocation(comCaseloadService, 'create')
  get(createPrefix('/change-team'), createTeamHandler.GET())
  post(createPrefix('/change-team'), createTeamHandler.POST())

  const varyTeamHandler = new ChangeTeamsLocation(comCaseloadService, 'vary')
  get(varyPrefix('/change-team'), varyTeamHandler.GET())
  post(varyPrefix('/change-team'), varyTeamHandler.POST())

  return router
}
