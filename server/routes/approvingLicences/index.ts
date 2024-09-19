import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import ApprovalCaseRoutes from './handlers/approvalCases'
import ApprovalViewRoutes from './handlers/approvalView'
import ConfirmApprovedRoutes from './handlers/confirmApproved'
import ConfirmRejectedRoutes from './handlers/confirmRejected'

import { Services } from '../../services'
import ComDetailsRoutes from './handlers/comDetails'

export default function Index({
  licenceService,
  approvedCaseloadService,
  probationService,
  prisonerService,
  conditionService,
}: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/licence/approve${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_DM']),
      fetchLicence(licenceService),
      asyncMiddleware(handler)
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_DM']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )

  const comDetailsHandler = new ComDetailsRoutes(probationService)
  const approvalCasesHandler = new ApprovalCaseRoutes(approvedCaseloadService, prisonerService)
  const approvalViewHandler = new ApprovalViewRoutes(licenceService, probationService)
  const approvalConfirmedHandler = new ConfirmApprovedRoutes(probationService)
  const approvalRejectedHandler = new ConfirmRejectedRoutes()

  get('/cases', approvalCasesHandler.GET)
  get('/id/:licenceId/probation-practitioner', comDetailsHandler.GET)
  get('/id/:licenceId/view', approvalViewHandler.GET)
  post('/id/:licenceId/view', approvalViewHandler.POST)
  get('/id/:licenceId/confirm-approved', approvalConfirmedHandler.GET)
  get('/id/:licenceId/confirm-rejected', approvalRejectedHandler.GET)

  return router
}
