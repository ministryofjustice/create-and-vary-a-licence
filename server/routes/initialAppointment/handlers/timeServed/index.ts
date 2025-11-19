import { RequestHandler, Router } from 'express'
import fetchLicence from '../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'
import timeServedCheckMiddleware from '../../../../middleware/timeServedCheckMiddleware'

import { Services } from '../../../../services'
import PersonName from '../../types/personName'
import InitialMeetingNameRoutes from './initialMeetingName'
import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import PathType from '../../../../enumeration/pathType'
import UserType from '../../../../enumeration/userType'

export default function Index({ licenceService, conditionService, addressService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/time-served${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
  const get = (path: string, handler: RequestHandler, userType: UserType) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      fetchLicence(licenceService),
      timeServedCheckMiddleware(userType),
      handler,
    )

  const post = (path: string, handler: RequestHandler, userType: UserType, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      timeServedCheckMiddleware(userType),
      handler,
    )
  {
    const controller = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-name', controller.GET, UserType.PRISON)
    post('/create/id/:licenceId/initial-meeting-name', controller.POST, UserType.PRISON, PersonName)
  }
  {
    const controller = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-place', controller.GET, UserType.PRISON)
  }
  return router
}
