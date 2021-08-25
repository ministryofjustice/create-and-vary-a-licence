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

export default function Index({ licenceService }: Services): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

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

  get('/licence/create/caseload', caseloadHandler.GET)
  get('/licence/create/crn/:crn/initial-meeting-name', initialMeetingNameHandler.GET)
  post('/licence/create/crn/:crn/initial-meeting-name', initialMeetingNameHandler.POST)
  get('/licence/create/id/:id/initial-meeting-place', initialMeetingPlaceHandler.GET)
  post('/licence/create/id/:id/initial-meeting-place', initialMeetingPlaceHandler.POST)
  get('/licence/create/id/:id/initial-meeting-contact', initialMeetingContactHandler.GET)
  post('/licence/create/id/:id/initial-meeting-contact', initialMeetingContactHandler.POST)
  get('/licence/create/id/:id/initial-meeting-time', initialMeetingTimeHandler.GET)
  post('/licence/create/id/:id/initial-meeting-time', initialMeetingTimeHandler.POST)
  get('/licence/create/id/:id/additional-conditions-question', additionalConditionsQuestionHandler.GET)
  post('/licence/create/id/:id/additional-conditions-question', additionalConditionsQuestionHandler.POST)
  get('/licence/create/id/:id/additional-conditions', additionalConditionsHandler.GET)
  post('/licence/create/id/:id/additional-conditions', additionalConditionsHandler.POST)
  get('/licence/create/id/:id/bespoke-conditions-question', bespokeConditionsQuestionHandler.GET)
  post('/licence/create/id/:id/bespoke-conditions-question', bespokeConditionsQuestionHandler.POST)
  get('/licence/create/id/:id/bespoke-conditions', bespokeConditionsHandler.GET)
  post('/licence/create/id/:id/bespoke-conditions', bespokeConditionsHandler.POST)
  get('/licence/create/id/:id/check-your-answers', checkAnswersHandler.GET)
  post('/licence/create/id/:id/check-your-answers', checkAnswersHandler.POST)
  get('/licence/create/id/:id/confirmation', confirmationHandler.GET)

  return router
}
