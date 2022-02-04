import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { Services } from '../../services'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import ViewAndPrintCaseRoutes from './handlers/viewCases'
import ViewAndPrintLicenceRoutes from './handlers/viewLicence'
import PrintLicenceRoutes from './handlers/printLicence'
import ComDetailsRoutes from './handlers/comDetails'

export default function Index({
  licenceService,
  prisonerService,
  communityService,
  caseloadService,
  qrCodeService,
}: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/licence/view${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      asyncMiddleware(handler)
    )

  const viewCasesHandler = new ViewAndPrintCaseRoutes(caseloadService)
  const viewLicenceHandler = new ViewAndPrintLicenceRoutes(licenceService)
  const printHandler = new PrintLicenceRoutes(prisonerService, qrCodeService, licenceService)
  const comDetailsHandler = new ComDetailsRoutes(communityService)

  get('/cases', viewCasesHandler.GET)
  get('/id/:licenceId/show', viewLicenceHandler.GET)
  get('/id/:licenceId/html-print', printHandler.preview)
  get('/id/:licenceId/pdf-print', printHandler.renderPdf)
  get('/id/:licenceId/probation-practitioner', comDetailsHandler.GET)

  return router
}
