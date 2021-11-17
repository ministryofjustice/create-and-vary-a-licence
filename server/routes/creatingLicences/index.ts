import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'

import CaseloadRoutes from './handlers/caseload'
import InitialMeetingNameRoutes from './handlers/initialMeetingName'
import InitialMeetingPlaceRoutes from './handlers/initialMeetingPlace'
import InitialMeetingContactRoutes from './handlers/initialMeetingContact'
import InitialMeetingTimeRoutes from './handlers/initialMeetingTime'
import AdditionalLicenceConditionsQuestionRoutes from './handlers/additionalLicenceConditionsQuestion'
import AdditionalLicenceConditionsRoutes from './handlers/additionalLicenceConditions'
import BespokeConditionsQuestionRoutes from './handlers/bespokeConditionsQuestion'
import BespokeConditionsRoutes from './handlers/bespokeConditions'
import BespokeConditions from './types/bespokeConditions'
import CheckAnswersRoutes from './handlers/checkAnswers'
import ConfirmationRoutes from './handlers/confirmation'
import { Services } from '../../services'
import PersonName from './types/personName'
import Address from './types/address'
import Telephone from './types/telephone'
import SimpleDateTime from './types/simpleDateTime'
import YesOrNoQuestion from './types/yesOrNo'
import AdditionalConditions from './types/additionalConditions'
import AdditionalLicenceConditionsCallbackRoutes from './handlers/additionalLicenceConditionsCallback'
import AdditionalLicenceConditionInputRoutes from './handlers/additionalLicenceConditionInput'
import AdditionalPssConditionsQuestionRoutes from './handlers/additionalPssConditionsQuestion'
import AdditionalPssConditionsRoutes from './handlers/additionalPssConditions'
import AdditionalPssConditionsCallbackRoutes from './handlers/additionalPssConditionsCallback'
import AdditionalPssConditionInputRoutes from './handlers/additionalPssConditionInput'

export default function Index({ licenceService, caseloadService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), fetchLicence(licenceService), asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler, type?: new () => unknown) =>
    router.post(routePrefix(path), fetchLicence(licenceService), validationMiddleware(type), asyncMiddleware(handler))

  const caseloadHandler = new CaseloadRoutes(licenceService, caseloadService)
  const initialMeetingNameHandler = new InitialMeetingNameRoutes(licenceService)
  const initialMeetingPlaceHandler = new InitialMeetingPlaceRoutes(licenceService)
  const initialMeetingContactHandler = new InitialMeetingContactRoutes(licenceService)
  const initialMeetingTimeHandler = new InitialMeetingTimeRoutes(licenceService)
  const additionalLicenceConditionsQuestionHandler = new AdditionalLicenceConditionsQuestionRoutes()
  const additionalLicenceConditionsHandler = new AdditionalLicenceConditionsRoutes(licenceService)
  const additionalLicenceConditionsCallbackHandler = new AdditionalLicenceConditionsCallbackRoutes()
  const additionalLicenceConditionInputHandler = new AdditionalLicenceConditionInputRoutes(licenceService)
  const additionalPssConditionsQuestionHandler = new AdditionalPssConditionsQuestionRoutes()
  const additionalPssConditionsHandler = new AdditionalPssConditionsRoutes(licenceService)
  const additionalPssConditionsCallbackHandler = new AdditionalPssConditionsCallbackRoutes()
  const additionalPssConditionInputHandler = new AdditionalPssConditionInputRoutes(licenceService)
  const bespokeConditionsQuestionHandler = new BespokeConditionsQuestionRoutes()
  const bespokeConditionsHandler = new BespokeConditionsRoutes(licenceService)
  const checkAnswersHandler = new CheckAnswersRoutes(licenceService)
  const confirmationHandler = new ConfirmationRoutes()

  get('/caseload', caseloadHandler.GET)
  post('/caseload', caseloadHandler.POST)
  get('/id/:licenceId/initial-meeting-name', initialMeetingNameHandler.GET)
  post('/id/:licenceId/initial-meeting-name', initialMeetingNameHandler.POST, PersonName)
  get('/id/:licenceId/initial-meeting-place', initialMeetingPlaceHandler.GET)
  post('/id/:licenceId/initial-meeting-place', initialMeetingPlaceHandler.POST, Address)
  get('/id/:licenceId/initial-meeting-contact', initialMeetingContactHandler.GET)
  post('/id/:licenceId/initial-meeting-contact', initialMeetingContactHandler.POST, Telephone)
  get('/id/:licenceId/initial-meeting-time', initialMeetingTimeHandler.GET)
  post('/id/:licenceId/initial-meeting-time', initialMeetingTimeHandler.POST, SimpleDateTime)
  get('/id/:licenceId/additional-licence-conditions-question', additionalLicenceConditionsQuestionHandler.GET)
  post(
    '/id/:licenceId/additional-licence-conditions-question',
    additionalLicenceConditionsQuestionHandler.POST,
    YesOrNoQuestion
  )
  get('/id/:licenceId/additional-licence-conditions', additionalLicenceConditionsHandler.GET)
  post('/id/:licenceId/additional-licence-conditions', additionalLicenceConditionsHandler.POST, AdditionalConditions)
  get('/id/:licenceId/additional-licence-conditions/callback', additionalLicenceConditionsCallbackHandler.GET)
  get('/id/:licenceId/additional-licence-conditions/condition/:conditionId', additionalLicenceConditionInputHandler.GET)
  post(
    '/id/:licenceId/additional-licence-conditions/condition/:conditionId',
    additionalLicenceConditionInputHandler.POST
  )
  get('/id/:licenceId/additional-pss-conditions-question', additionalPssConditionsQuestionHandler.GET)
  post(
    '/id/:licenceId/additional-pss-conditions-question',
    additionalPssConditionsQuestionHandler.POST,
    YesOrNoQuestion
  )
  get('/id/:licenceId/additional-pss-conditions', additionalPssConditionsHandler.GET)
  post('/id/:licenceId/additional-pss-conditions', additionalPssConditionsHandler.POST, AdditionalConditions)
  get('/id/:licenceId/additional-pss-conditions/callback', additionalPssConditionsCallbackHandler.GET)
  get('/id/:licenceId/additional-pss-conditions/condition/:conditionId', additionalPssConditionInputHandler.GET)
  post('/id/:licenceId/additional-pss-conditions/condition/:conditionId', additionalPssConditionInputHandler.POST)
  get('/id/:licenceId/bespoke-conditions-question', bespokeConditionsQuestionHandler.GET)
  post('/id/:licenceId/bespoke-conditions-question', bespokeConditionsQuestionHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/bespoke-conditions', bespokeConditionsHandler.GET)
  post('/id/:licenceId/bespoke-conditions', bespokeConditionsHandler.POST, BespokeConditions)
  get('/id/:licenceId/check-your-answers', checkAnswersHandler.GET)
  post('/id/:licenceId/check-your-answers', checkAnswersHandler.POST)
  get('/id/:licenceId/confirmation', confirmationHandler.GET)

  return router
}
