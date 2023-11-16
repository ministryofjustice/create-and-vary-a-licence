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
import DateTime from './types/dateTime'

import EditQuestionRoutes from './handlers/editQuestion'
import ComDetailsRoutes from './handlers/comDetails'
import YesOrNoQuestion from './types/yesOrNo'
import ConfirmCreateRoutes from './handlers/confirmCreate'
import AdditionalLicenceConditionsQuestionRoutes from './handlers/additionalLicenceConditionsQuestion'
import AdditionalConditionsYesOrNo from './types/additionalConditionsYesOrNo'
import AdditionalPssConditionsQuestionRoutes from './handlers/additionalPssConditionsQuestion'
import BespokeConditionsQuestionRoutes from './handlers/bespokeConditionsQuestion'
import PssConditionsYesOrNo from './types/pssConditionsYesOrNo'
import BespokeConditionsYesOrNo from './types/bespokeConditionsYesOrNo'

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

  {
    const controller = new CaseloadRoutes(caseloadService)
    get('/caseload', controller.GET)
  }

  {
    const controller = new ComDetailsRoutes(communityService)
    get('/probation-practitioner/staffCode/:staffCode', controller.GET)
  }

  {
    const controller = new ConfirmCreateRoutes(
      communityService,
      prisonerService,
      licenceService,
      ukBankHolidayFeedService
    )
    get('/nomisId/:nomisId/confirm', controller.GET)
    post('/nomisId/:nomisId/confirm', controller.POST, YesOrNoQuestion)
  }

  {
    const controller = new InitialMeetingNameRoutes(licenceService, ukBankHolidayFeedService)
    get('/id/:licenceId/initial-meeting-name', controller.GET)
    post('/id/:licenceId/initial-meeting-name', controller.POST, PersonName)
  }

  {
    const controllr = new InitialMeetingPlaceRoutes(licenceService, ukBankHolidayFeedService)
    get('/id/:licenceId/initial-meeting-place', controllr.GET)
    post('/id/:licenceId/initial-meeting-place', controllr.POST, Address)
  }

  {
    const controller = new InitialMeetingContactRoutes(licenceService, ukBankHolidayFeedService)
    get('/id/:licenceId/initial-meeting-contact', controller.GET)
    post('/id/:licenceId/initial-meeting-contact', controller.POST, Telephone)
  }

  {
    const controller = new InitialMeetingTimeRoutes(licenceService, ukBankHolidayFeedService)
    get('/id/:licenceId/initial-meeting-time', controller.GET)
    post('/id/:licenceId/initial-meeting-time', controller.POST, DateTime)
  }
  {
    const controller = new AdditionalLicenceConditionsQuestionRoutes()
    get('/id/:licenceId/additional-licence-conditions-question', controller.GET)
    post('/id/:licenceId/additional-licence-conditions-question', controller.POST, AdditionalConditionsYesOrNo)
  }

  {
    const controller = new AdditionalPssConditionsQuestionRoutes()
    get('/id/:licenceId/additional-pss-conditions-question', controller.GET)
    post('/id/:licenceId/additional-pss-conditions-question', controller.POST, PssConditionsYesOrNo)
  }

  {
    const controller = new BespokeConditionsQuestionRoutes()
    get('/id/:licenceId/bespoke-conditions-question', controller.GET)
    post('/id/:licenceId/bespoke-conditions-question', controller.POST, BespokeConditionsYesOrNo)
  }

  {
    const controller = new CheckAnswersRoutes(licenceService, conditionService)
    get('/id/:licenceId/check-your-answers', controller.GET)
    post('/id/:licenceId/check-your-answers', controller.POST)
  }

  {
    const controller = new EditQuestionRoutes(licenceService)
    get('/id/:licenceId/edit', controller.GET)
    post('/id/:licenceId/edit', controller.POST, YesOrNoQuestion)
  }

  {
    const controller = new ConfirmationRoutes()
    get('/id/:licenceId/confirmation', controller.GET)
  }
  return router
}
