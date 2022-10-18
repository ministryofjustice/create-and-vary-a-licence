import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import { Services } from '../../services'
import VaryApproveListRoutes from './handlers/varyApproveList'
import VaryApproveViewRoutes from './handlers/varyApproveView'
import VaryApproveConfirmRoutes from './handlers/varyApproveConfirm'
import VaryReferRoutes from './handlers/varyRefer'
import VaryReferConfirmRoutes from './handlers/varyReferConfirm'
import ComDetailsRoutes from './handlers/comDetails'
import ReasonForReferral from '../creatingLicences/types/reasonForReferral'

export default function Index({
  licenceService,
  caseloadService,
  communityService,
  conditionService,
}: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/licence/vary-approve${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */

  // Setup middleware processing for GET
  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_ACO']),
      fetchLicence(licenceService),
      asyncMiddleware(handler)
    )

  // Setup middleware processing for POST
  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_ACO']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )

  // Define route handlers for variation approvals
  const listHandler = new VaryApproveListRoutes(caseloadService)
  const viewHandler = new VaryApproveViewRoutes(licenceService)
  const approveConfirmHandler = new VaryApproveConfirmRoutes()
  const referHandler = new VaryReferRoutes(licenceService)
  const referConfirmHandler = new VaryReferConfirmRoutes()
  const comDetailsHandler = new ComDetailsRoutes(communityService)

  // Define the URLs and handler method for variation approvals
  get('/list', listHandler.GET)
  get('/id/:licenceId/view', viewHandler.GET)
  post('/id/:licenceId/view', viewHandler.POST)
  get('/id/:licenceId/approve', approveConfirmHandler.GET)
  get('/id/:licenceId/refer', referHandler.GET)
  post('/id/:licenceId/refer', referHandler.POST, ReasonForReferral)
  get('/id/:licenceId/refer-confirm', referConfirmHandler.GET)
  get('/id/:licenceId/probation-practitioner', comDetailsHandler.GET)

  return router
}
