import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import CaseloadRoutes from './handlers/caseload'
import InitialMeetingNameRoutes from './handlers/initialMeetingName'
import InitialMeetingPlaceRoutes from './handlers/initialMeetingPlace'
import InitialMeetingContactRoutes from './handlers/initialMeetingContact'
import InitialMeetingTimeRoutes from './handlers/initialMeetingTime'
import AdditionalConditionsQuestionRoutes from './handlers/additionalConditionsQuestion'
import AdditionalConditionsRoutes from './handlers/additionalConditions'
import BespokeConditionsQuestionRoutes from './handlers/bespokeConditionsQuestion'
import BespokeConditionsRoutes from './handlers/bespokeConditions'
import CheckAnswersRoutes from './handlers/checkAnswers'
import ConfirmationRoutes from './handlers/confirmation'
import { Services } from '../../services'
import PersonName from './types/personName'
import validationMiddleware from '../../middleware/validationMiddleware'
import Address from './types/address'
import Telephone from './types/telephone'
import SimpleDateTime from './types/simpleDateTime'
import YesOrNoQuestion from './types/yesOrNo'

export default function Index({ licenceService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create${path}`

  const get = (path: string, handler: RequestHandler) => router.get(routePrefix(path), asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler, type?: new () => unknown) =>
    router.post(routePrefix(path), validationMiddleware(type), asyncMiddleware(handler))

  const caseloadHandler = new CaseloadRoutes()
  const initialMeetingNameHandler = new InitialMeetingNameRoutes()
  const initialMeetingPlaceHandler = new InitialMeetingPlaceRoutes()
  const initialMeetingContactHandler = new InitialMeetingContactRoutes()
  const initialMeetingTimeHandler = new InitialMeetingTimeRoutes()
  const additionalConditionsQuestionHandler = new AdditionalConditionsQuestionRoutes()
  const additionalConditionsHandler = new AdditionalConditionsRoutes()
  const bespokeConditionsQuestionHandler = new BespokeConditionsQuestionRoutes()
  const bespokeConditionsHandler = new BespokeConditionsRoutes()
  const checkAnswersHandler = new CheckAnswersRoutes(licenceService)
  const confirmationHandler = new ConfirmationRoutes()

  get('/caseload', caseloadHandler.GET)
  get('/crn/:crn/initial-meeting-name', initialMeetingNameHandler.GET)
  post('/crn/:crn/initial-meeting-name', initialMeetingNameHandler.POST, PersonName)
  get('/id/:id/initial-meeting-place', initialMeetingPlaceHandler.GET)
  post('/id/:id/initial-meeting-place', initialMeetingPlaceHandler.POST, Address)
  get('/id/:id/initial-meeting-contact', initialMeetingContactHandler.GET)
  post('/id/:id/initial-meeting-contact', initialMeetingContactHandler.POST, Telephone)
  get('/id/:id/initial-meeting-time', initialMeetingTimeHandler.GET)
  post('/id/:id/initial-meeting-time', initialMeetingTimeHandler.POST, SimpleDateTime)
  get('/id/:id/additional-conditions-question', additionalConditionsQuestionHandler.GET)
  post('/id/:id/additional-conditions-question', additionalConditionsQuestionHandler.POST, YesOrNoQuestion)
  get('/id/:id/additional-conditions', additionalConditionsHandler.GET)
  post('/id/:id/additional-conditions', additionalConditionsHandler.POST)
  get('/id/:id/bespoke-conditions-question', bespokeConditionsQuestionHandler.GET)
  post('/id/:id/bespoke-conditions-question', bespokeConditionsQuestionHandler.POST, YesOrNoQuestion)
  get('/id/:id/bespoke-conditions', bespokeConditionsHandler.GET)
  post('/id/:id/bespoke-conditions', bespokeConditionsHandler.POST)
  get('/id/:id/check-your-answers', checkAnswersHandler.GET)
  post('/id/:id/check-your-answers', checkAnswersHandler.POST)
  get('/id/:id/confirmation', confirmationHandler.GET)

  return router
}
