import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import CaseloadRoutes from './handlers/caseload'
import CheckAnswersRoutes from './handlers/checkAnswers'
import ConfirmationRoutes from './handlers/confirmation'
import { Services } from '../../services'

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
import PrisonWillCreateThisLicenceRoutes from './handlers/prisonWillCreateThisLicence'
import LicenceCreatedByPrisonRoutes from './handlers/licenceCreatedByPrison'
import LicenceChangesNotApprovedInTimeRoutes from './handlers/licenceChangesNotApprovedInTime'
import hardStopCheckMiddleware from '../../middleware/hardStopCheckMiddleware'
import UserType from '../../enumeration/userType'

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
      asyncMiddleware(handler),
      hardStopCheckMiddleware(UserType.PROBATION)
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
    const controller = new CaseloadRoutes(caseloadService, ukBankHolidayFeedService)
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

  {
    const controller = new PrisonWillCreateThisLicenceRoutes(licenceService, communityService)
    get('/nomisId/:nomisId/prison-will-create-this-licence', controller.GET)
  }

  {
    const controller = new LicenceCreatedByPrisonRoutes(licenceService)
    get('/id/:licenceId/licence-created-by-prison', controller.GET)
  }

  {
    const controller = new LicenceChangesNotApprovedInTimeRoutes(licenceService, conditionService)
    get('/id/:licenceId/licence-changes-not-approved-in-time', controller.GET)
  }
  return router
}
