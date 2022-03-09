import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import CaseloadRoutes from './handlers/caseload'
import { Services } from '../../services'
import ViewVariationRoutes from './handlers/viewVariation'
import ConfirmVaryActionRoutes from './handlers/confirmVaryAction'
import validationMiddleware from '../../middleware/validationMiddleware'
import YesOrNoQuestion from '../creatingLicences/types/yesOrNo'
import YesOrNotApplicable from '../creatingLicences/types/yesOrNotApplicable'
import SpoDiscussionRoutes from './handlers/spoDiscussion'
import VloDiscussionRoutes from './handlers/vloDiscussion'
import ConfirmDiscardVariationRoutes from './handlers/confirmDiscardVariation'
import ConfirmAmendVariationRoutes from './handlers/confirmAmendVariation'
import ReasonForVariationRoutes from './handlers/reasonForVariation'
import VariationSummaryRoutes from './handlers/variationSummary'
import ConfirmationRoutes from './handlers/confirmation'
import ReasonForVariation from '../creatingLicences/types/reasonForVariation'
import ComDetailsRoutes from './handlers/comDetails'

export default function Index({ licenceService, caseloadService, communityService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/vary${path}`

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
      validationMiddleware(type),
      asyncMiddleware(handler)
    )

  const caseloadHandler = new CaseloadRoutes(caseloadService)
  const comDetailsHandler = new ComDetailsRoutes(communityService)
  const viewLicenceHandler = new ViewVariationRoutes(licenceService)
  const confirmVaryActionHandler = new ConfirmVaryActionRoutes(licenceService)
  const spoDiscussionHandler = new SpoDiscussionRoutes(licenceService)
  const vloDiscussionHandler = new VloDiscussionRoutes(licenceService)
  const confirmAmendVariationHandler = new ConfirmAmendVariationRoutes(licenceService)
  const confirmDiscardVariationHandler = new ConfirmDiscardVariationRoutes(licenceService)
  const reasonForVariationHandler = new ReasonForVariationRoutes(licenceService)
  const variationSummaryHandler = new VariationSummaryRoutes(licenceService)
  const confirmationHandler = new ConfirmationRoutes()

  get('/caseload', caseloadHandler.GET)
  get('/id/:licenceId/probation-practitioner', comDetailsHandler.GET)
  get('/id/:licenceId/view', viewLicenceHandler.GET)
  get('/id/:licenceId/confirm-vary-action', confirmVaryActionHandler.GET)
  post('/id/:licenceId/confirm-vary-action', confirmVaryActionHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/spo-discussion', spoDiscussionHandler.GET)
  post('/id/:licenceId/spo-discussion', spoDiscussionHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/vlo-discussion', vloDiscussionHandler.GET)
  post('/id/:licenceId/vlo-discussion', vloDiscussionHandler.POST, YesOrNotApplicable)
  get('/id/:licenceId/confirm-amend-variation', confirmAmendVariationHandler.GET)
  post('/id/:licenceId/confirm-amend-variation', confirmAmendVariationHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/confirm-discard-variation', confirmDiscardVariationHandler.GET)
  post('/id/:licenceId/confirm-discard-variation', confirmDiscardVariationHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/reason-for-variation', reasonForVariationHandler.GET)
  post('/id/:licenceId/reason-for-variation', reasonForVariationHandler.POST, ReasonForVariation)
  get('/id/:licenceId/summary', variationSummaryHandler.GET)
  post('/id/:licenceId/summary', variationSummaryHandler.POST)
  get('/id/:licenceId/confirmation', confirmationHandler.GET)

  return router
}
