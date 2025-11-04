import { RequestHandler, Router } from 'express'
import fetchLicence from '../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'

import { Services } from '../../../../services'

import ConfirmCreateRoutes from './confirmCreate'
import NomisOrCvl from '../../types/nomisOrCvl'

import config from '../../../../config'

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/time-served${path}`

  const { timeServedEnabled } = config

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_CA']), fetchLicence(licenceService), handler)

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      handler,
    )
  {
    const controller = new ConfirmCreateRoutes(licenceService)

    if (timeServedEnabled) {
      get('/create/nomisId/:nomisId/confirm', controller.GET)
      post('/create/nomisId/:nomisId/confirm', controller.POST, NomisOrCvl)
    }
  }
  return router
}
