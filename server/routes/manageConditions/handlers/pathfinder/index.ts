import { RequestHandler, Router } from 'express'
import checkLicenceAccessForJourney from '../../../../middleware/checkLicenceAccessForJourney'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'

import type { Services } from '../../../../services'
import PathfinderRoutes from './pathfinderRoutes'
import TaggedForProgramme from '../../../creatingLicences/types/taggedForProgramme'

export default function Index({ auditService, licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create/id/:licenceId${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(auditService, ['ROLE_LICENCE_RO']),
      checkLicenceAccessForJourney(auditService, licenceService),
      handler,
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(auditService, ['ROLE_LICENCE_RO']),
      checkLicenceAccessForJourney(auditService, licenceService),
      validationMiddleware(conditionService, type),
      handler,
    )

  {
    const controller = new PathfinderRoutes(licenceService)
    get('/add-pathfinder', controller.GET)
    post('/add-pathfinder', controller.POST, TaggedForProgramme)
  }

  return router
}
