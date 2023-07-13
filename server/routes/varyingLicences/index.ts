import { RequestHandler, Request, Response, NextFunction, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import CaseloadRoutes from './handlers/caseload'
import { Services } from '../../services'
import ViewVariationRoutes from './handlers/viewVariation'
import ViewActiveLicenceRoutes from './handlers/viewActiveLicence'
import ConfirmVaryActionRoutes from './handlers/confirmVaryAction'
import validationMiddleware from '../../middleware/validationMiddleware'
import SpoDiscussionRoutes from './handlers/spoDiscussion'
import VloDiscussionRoutes from './handlers/vloDiscussion'
import ConfirmDiscardVariationRoutes from './handlers/confirmDiscardVariation'
import ConfirmAmendVariationRoutes from './handlers/confirmAmendVariation'
import ReasonForVariationRoutes from './handlers/reasonForVariation'
import VariationSummaryRoutes from './handlers/variationSummary'
import ConfirmationRoutes from './handlers/confirmation'
import ReasonForVariation from '../creatingLicences/types/reasonForVariation'
import ComDetailsRoutes from './handlers/comDetails'
import TimelineRoutes from './handlers/timeline'
import YesOrNoQuestion from '../creatingLicences/types/yesOrNo'
import YesOrNotApplicable from '../creatingLicences/types/yesOrNotApplicable'
import DeleteVariation from './types/deleteVariation'
import PolicyChangesNoticeRoutes from './handlers/policyChangesNotice'
import PolicyChangesCallbackRoutes from './handlers/policyChangesCallback'
import PolicyChangeRoutes from './handlers/policyChange'
import PolicyChangesInputCallbackRoutes from './handlers/policyChangesInputCallback'
import PolicyConfirmDeleteRoutes from './handlers/policyConfirmDelete'

function alterResObject() {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.isVaryJourney = true
    next()
  }
}

export default function Index({
  licenceService,
  caseloadService,
  communityService,
  conditionService,
  licenceApiClient,
}: Services): Router {
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
      alterResObject(),
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
  const timelineHandler = new TimelineRoutes(licenceService)
  const viewLicenceHandler = new ViewVariationRoutes(licenceApiClient, licenceService, conditionService)
  const viewActiveLicenceHandler = new ViewActiveLicenceRoutes(conditionService)
  const confirmVaryActionHandler = new ConfirmVaryActionRoutes(licenceService)
  const spoDiscussionHandler = new SpoDiscussionRoutes(licenceService)
  const vloDiscussionHandler = new VloDiscussionRoutes(licenceApiClient, licenceService, conditionService)
  const confirmAmendVariationHandler = new ConfirmAmendVariationRoutes(
    licenceApiClient,
    licenceService,
    conditionService
  )
  const confirmDiscardVariationHandler = new ConfirmDiscardVariationRoutes(licenceService)
  const reasonForVariationHandler = new ReasonForVariationRoutes(licenceService)
  const variationSummaryHandler = new VariationSummaryRoutes(licenceService, communityService)
  const confirmationHandler = new ConfirmationRoutes()
  const policyChangesNoticeHandler = new PolicyChangesNoticeRoutes(licenceService)
  const policyChangesCallbackHandler = new PolicyChangesCallbackRoutes()
  const policyChangeHandler = new PolicyChangeRoutes(licenceApiClient, licenceService, conditionService)
  const policyConfirmDeleteHandler = new PolicyConfirmDeleteRoutes()
  const policyChangeInputCallbackHandler = new PolicyChangesInputCallbackRoutes(conditionService)

  get('/caseload', caseloadHandler.GET)
  get('/id/:licenceId/probation-practitioner', comDetailsHandler.GET)
  get('/id/:licenceId/timeline', timelineHandler.GET)
  post('/id/:licenceId/timeline', timelineHandler.POST)
  get('/id/:licenceId/view', viewLicenceHandler.GET)
  get('/id/:licenceId/view-active', viewActiveLicenceHandler.GET)
  get('/id/:licenceId/confirm-vary-action', confirmVaryActionHandler.GET)
  post('/id/:licenceId/confirm-vary-action', confirmVaryActionHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/spo-discussion', spoDiscussionHandler.GET)
  post('/id/:licenceId/spo-discussion', spoDiscussionHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/vlo-discussion', vloDiscussionHandler.GET)
  post('/id/:licenceId/vlo-discussion', vloDiscussionHandler.POST, YesOrNotApplicable)
  get('/id/:licenceId/confirm-amend-variation', confirmAmendVariationHandler.GET)
  post('/id/:licenceId/confirm-amend-variation', confirmAmendVariationHandler.POST, YesOrNoQuestion)
  get('/id/:licenceId/confirm-discard-variation', confirmDiscardVariationHandler.GET)
  post('/id/:licenceId/confirm-discard-variation', confirmDiscardVariationHandler.POST, DeleteVariation)
  get('/id/:licenceId/reason-for-variation', reasonForVariationHandler.GET)
  post('/id/:licenceId/reason-for-variation', reasonForVariationHandler.POST, ReasonForVariation)
  get('/id/:licenceId/summary', variationSummaryHandler.GET)
  post('/id/:licenceId/summary', variationSummaryHandler.POST)
  get('/id/:licenceId/confirmation', confirmationHandler.GET)
  get('/id/:licenceId/policy-changes', policyChangesNoticeHandler.GET)
  post('/id/:licenceId/policy-changes', policyChangesNoticeHandler.POST)
  get('/id/:licenceId/policy-changes/callback', policyChangesCallbackHandler.GET)
  get('/id/:licenceId/policy-changes/condition/:changeCounter', policyChangeHandler.GET)
  post('/id/:licenceId/policy-changes/condition/:changeCounter', policyChangeHandler.POST)
  post('/id/:licenceId/policy-changes/condition/:changeCounter/delete', policyChangeHandler.DELETE)
  get('/id/:licenceId/policy-changes/condition/:changeCounter/delete', policyConfirmDeleteHandler.GET)
  get('/id/:licenceId/policy-changes/input/callback/:changeCounter', policyChangeInputCallbackHandler.GET)

  return router
}
