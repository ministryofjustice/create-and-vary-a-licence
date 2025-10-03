import { RequestHandler, Router } from 'express'
import fetchLicence from '../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'

import { Services } from '../../../../services'
import ConfirmCreateRoutes from './confirmCreate'
import preLicenceCreationMiddleware from '../../../../middleware/preLicenceCreationMiddleware'

export default function Index({
  licenceService,
  conditionService,
  probationService,
  prisonerService,
}: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/hdc${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      preLicenceCreationMiddleware(probationService),
      handler,
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      handler,
    )
  {
    const controller = new ConfirmCreateRoutes(probationService, licenceService, prisonerService)
    get('/create/nomisId/:nomisId/confirm', controller.GET)
    post('/create/nomisId/:nomisId/confirm', controller.POST)
  }
  return router
}
