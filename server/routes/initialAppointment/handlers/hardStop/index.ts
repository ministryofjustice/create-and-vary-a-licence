import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'
import fetchLicence from '../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'

import { Services } from '../../../../services'
import PersonName from '../../types/personName'
import InitialMeetingNameRoutes from './initialMeetingName'

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/hardstop${path}`

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
      asyncMiddleware(handler)
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )
  {
    const controller = new InitialMeetingNameRoutes(licenceService)
    get('/create/id/:licenceId/initial-meeting-name', controller.GET)
    post('/create/id/:licenceId/initial-meeting-name', controller.POST, PersonName)
  }
  return router
}
