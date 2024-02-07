import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import InitialMeetingNameRoutes from './handlers/initialMeetingName'
import InitialMeetingPlaceRoutes from './handlers/initialMeetingPlace'
import InitialMeetingContactRoutes from './handlers/initialMeetingContact'
import InitialMeetingTimeRoutes from './handlers/initialMeetingTime'
import { Services } from '../../services'
import PersonName from './types/personName'
import Address from './types/address'
import Telephone from './types/telephone'
import DateTime from './types/dateTime'
import UserType from '../../enumeration/userType'

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      asyncMiddleware(handler)
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )

  {
    const controller = new InitialMeetingNameRoutes(licenceService, UserType.PROBATION)
    get('/create/id/:licenceId/initial-meeting-name', controller.GET)
    post('/create/id/:licenceId/initial-meeting-name', controller.POST, PersonName)
  }

  {
    const controller = new InitialMeetingNameRoutes(licenceService, UserType.PRISON)
    get('/view/id/:licenceId/initial-meeting-name', controller.GET)
    post('/view/id/:licenceId/initial-meeting-name', controller.POST, PersonName)
  }

  {
    const controller = new InitialMeetingPlaceRoutes(licenceService, UserType.PROBATION)
    get('/create/id/:licenceId/initial-meeting-place', controller.GET)
    post('/create/id/:licenceId/initial-meeting-place', controller.POST, Address)
  }

  {
    const controller = new InitialMeetingPlaceRoutes(licenceService, UserType.PRISON)
    get('/view/id/:licenceId/initial-meeting-place', controller.GET)
    post('/view/id/:licenceId/initial-meeting-place', controller.POST, Address)
  }

  {
    const controller = new InitialMeetingContactRoutes(licenceService, UserType.PROBATION)
    get('/create/id/:licenceId/initial-meeting-contact', controller.GET)
    post('/create/id/:licenceId/initial-meeting-contact', controller.POST, Telephone)
  }

  {
    const controller = new InitialMeetingContactRoutes(licenceService, UserType.PRISON)
    get('/view/id/:licenceId/initial-meeting-contact', controller.GET)
    post('/view/id/:licenceId/initial-meeting-contact', controller.POST, Telephone)
  }

  {
    const controller = new InitialMeetingTimeRoutes(licenceService, UserType.PROBATION)
    get('/create/id/:licenceId/initial-meeting-time', controller.GET)
    post('/create/id/:licenceId/initial-meeting-time', controller.POST, DateTime)
  }

  {
    const controller = new InitialMeetingTimeRoutes(licenceService, UserType.PRISON)
    get('/view/id/:licenceId/initial-meeting-time', controller.GET)
    post('/view/id/:licenceId/initial-meeting-time', controller.POST, DateTime)
  }
  return router
}
