import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'

import ApprovalCaseRoutes from './handlers/approvalCases'
import ApprovalViewRoutes from './handlers/approvalView'
import ConfirmApprovedRoutes from './handlers/confirmApproved'
import ConfirmRejectedRoutes from './handlers/confirmRejected'

import { Services } from '../../services'

export default function Index({ licenceService }: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/licence/approve${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), fetchLicence(licenceService), asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler, type?: new () => unknown) =>
    router.post(routePrefix(path), validationMiddleware(type), asyncMiddleware(handler))

  const approvalCasesHandler = new ApprovalCaseRoutes(licenceService)
  const approvalViewHandler = new ApprovalViewRoutes(licenceService)
  const approvalConfirmedHandler = new ConfirmApprovedRoutes()
  const approvalRejectedHandler = new ConfirmRejectedRoutes()

  get('/cases', approvalCasesHandler.GET)
  post('/cases', approvalCasesHandler.POST)
  get('/id/:licenceId/view', approvalViewHandler.GET)
  post('/id/:licenceId/view', approvalViewHandler.POST)
  get('/id/:licenceId/confirm-approved', approvalConfirmedHandler.GET)
  get('/id/:licenceId/confirm-rejected', approvalRejectedHandler.GET)

  return router
}
