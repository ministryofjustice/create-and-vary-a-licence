import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import CaseloadRoutes from './handlers/caseload'
import InitialMeetingNameRoutes from './handlers/initialMeetingName'
import InitialMeetingPlaceRoutes from './handlers/initialMeetingPlace'
import InitialMeetingContactRoutes from './handlers/initialMeetingContact'
import InitialMeetingTimeRoutes from './handlers/initialMeetingTime'
import CheckAnswersRoutes from './handlers/checkAnswers'
import ConfirmationRoutes from './handlers/confirmation'
import { Services } from '../../services'
import PersonName from './types/personName'
import Address from './types/address'
import Telephone from './types/telephone'
import SimpleDateTime from './types/simpleDateTime'

import EditQuestionRoutes from './handlers/editQuestion'
import ComDetailsRoutes from './handlers/comDetails'
import YesOrNoQuestion from './types/yesOrNo'
import ConfirmCreateRoutes from './handlers/confirmCreate'

export default function Index({
  licenceService,
  caseloadService,
  communityService,
  prisonerService,
  ukBankHolidayFeedService,
  conditionService,
}: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create${path}`

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
      asyncMiddleware(handler)
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )

  const caseloadHandler = new CaseloadRoutes(caseloadService)
  const comDetailsHandler = new ComDetailsRoutes(communityService)
  const confirmCreateHandler = new ConfirmCreateRoutes(
    communityService,
    prisonerService,
    licenceService,
    ukBankHolidayFeedService
  )
  const initialMeetingNameHandler = new InitialMeetingNameRoutes(licenceService, ukBankHolidayFeedService)
  const initialMeetingPlaceHandler = new InitialMeetingPlaceRoutes(licenceService, ukBankHolidayFeedService)
  const initialMeetingContactHandler = new InitialMeetingContactRoutes(licenceService, ukBankHolidayFeedService)
  const initialMeetingTimeHandler = new InitialMeetingTimeRoutes(licenceService, ukBankHolidayFeedService)
  const checkAnswersHandler = new CheckAnswersRoutes(licenceService, conditionService)
  const editQuestionHandler = new EditQuestionRoutes(licenceService)
  const confirmationHandler = new ConfirmationRoutes()

  get('/caseload', caseloadHandler.GET)
  get('/probation-practitioner/staffCode/:staffCode', comDetailsHandler.GET)
  get('/nomisId/:nomisId/confirm', confirmCreateHandler.GET)
  post('/nomisId/:nomisId/confirm', confirmCreateHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/initial-meeting-name', initialMeetingNameHandler.GET)
  post('/id/:licenceId/initial-meeting-name', initialMeetingNameHandler.POST, PersonName)
  get('/id/:licenceId/initial-meeting-place', initialMeetingPlaceHandler.GET)
  post('/id/:licenceId/initial-meeting-place', initialMeetingPlaceHandler.POST, Address)
  get('/id/:licenceId/initial-meeting-contact', initialMeetingContactHandler.GET)
  post('/id/:licenceId/initial-meeting-contact', initialMeetingContactHandler.POST, Telephone)
  get('/id/:licenceId/initial-meeting-time', initialMeetingTimeHandler.GET)
  post('/id/:licenceId/initial-meeting-time', initialMeetingTimeHandler.POST, SimpleDateTime)

  get('/id/:licenceId/check-your-answers', checkAnswersHandler.GET)
  post('/id/:licenceId/check-your-answers', checkAnswersHandler.POST)
  get('/id/:licenceId/edit', editQuestionHandler.GET)
  post('/id/:licenceId/edit', editQuestionHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/confirmation', confirmationHandler.GET)

  return router
}
