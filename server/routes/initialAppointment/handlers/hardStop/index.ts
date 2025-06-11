import { RequestHandler, Router } from 'express'
import fetchLicence from '../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'

import { Services } from '../../../../services'
import PersonName from '../../types/personName'
import InitialMeetingNameRoutes from './initialMeetingName'
import Address from '../../types/address'
import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import InitialMeetingContactRoutes from './initialMeetingContact'
import Telephone from '../../types/telephone'
import InitialMeetingTimeRoutes from './initialMeetingTime'
import DateTime from '../../types/dateTime'
import ViewAndPrintLicenceRoutes from '../../../viewingLicences/handlers/viewLicence'
import ConfirmationRoutes from '../../../creatingLicences/handlers/hardStop/confirmation'
import PathType from '../../../../enumeration/pathType'

export default function Index({ licenceService, conditionService, hdcService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/hard-stop${path}`

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
    const controller = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-name', controller.GET)
    post('/create/id/:licenceId/initial-meeting-name', controller.POST, PersonName)
  }
  {
    const controller = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-name', controller.GET)
    post('/edit/id/:licenceId/initial-meeting-name', controller.POST, PersonName)
  }
  {
    const controller = new InitialMeetingPlaceRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-place', controller.GET)
    post('/create/id/:licenceId/initial-meeting-place', controller.POST, Address)
  }
  {
    const controller = new InitialMeetingPlaceRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-place', controller.GET)
    post('/edit/id/:licenceId/initial-meeting-place', controller.POST, Address)
  }
  {
    const controller = new InitialMeetingContactRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-contact', controller.GET)
    post('/create/id/:licenceId/initial-meeting-contact', controller.POST, Telephone)
  }
  {
    const controller = new InitialMeetingContactRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-contact', controller.GET)
    post('/edit/id/:licenceId/initial-meeting-contact', controller.POST, Telephone)
  }
  {
    const controller = new InitialMeetingTimeRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-time', controller.GET)
    post('/create/id/:licenceId/initial-meeting-time', controller.POST, DateTime)
  }
  {
    const controller = new InitialMeetingTimeRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-time', controller.GET)
    post('/edit/id/:licenceId/initial-meeting-time', controller.POST, DateTime)
  }
  {
    const controller = new ViewAndPrintLicenceRoutes(licenceService, hdcService)
    get('/id/:licenceId/check-your-answers', controller.GET)
    post('/id/:licenceId/check-your-answers', controller.POST)
  }
  {
    const controller = new ConfirmationRoutes()
    get('/id/:licenceId/confirmation', controller.GET)
  }
  return router
}
