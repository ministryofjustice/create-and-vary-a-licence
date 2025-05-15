import { RequestHandler, Router } from 'express'
import fetchLicence from '../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'

import type { Services } from '../../../../services'
import CurfewRoutes from './curfewRoutes'

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create/id/:licenceId${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_RO']), fetchLicence(licenceService), handler)

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      handler,
    )

  {
    // View map list / add new map condition
    const controller = new CurfewRoutes(licenceService, conditionService)
    get('/additional-licence-conditions/condition/:conditionCode/curfew', controller.GET)
    post('/additional-licence-conditions/condition/:conditionCode/curfew', controller.POST)
  }

  return router
}
