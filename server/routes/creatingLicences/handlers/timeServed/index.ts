import { RequestHandler, Router } from 'express'
import fetchLicence from '../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'

import { Services } from '../../../../services'

import ConfirmCreateRoutes from './confirmCreate'
import CreateLicenceInNomisOrCvl from '../../types/createLicenceInNomisOrCvl'

import hardStopCheckMiddleware from '../../../../middleware/hardStopCheckMiddleware'
import UserType from '../../../../enumeration/userType'

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/time-served${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      fetchLicence(licenceService),
      hardStopCheckMiddleware(UserType.PRISON),
      handler,
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      hardStopCheckMiddleware(UserType.PRISON),
      handler,
    )
  {
    const controller = new ConfirmCreateRoutes(licenceService)

    get('/create/nomisId/:nomisId/do-you-want-to-create-the-licence-on-this-service', controller.GET)
    post(
      '/create/nomisId/:nomisId/do-you-want-to-create-the-licence-on-this-service',
      controller.POST,
      CreateLicenceInNomisOrCvl,
    )
  }
  return router
}
