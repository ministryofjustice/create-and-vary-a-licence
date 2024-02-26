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
      roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_RO', 'ROLE_LICENCE_DM']),
      fetchLicence(licenceService),
      asyncMiddleware(handler)
    )

  const viewCasesHandler = new ViewAndPrintCaseRoutes(caseloadService, prisonerService)
  const viewLicenceHandler = new ViewAndPrintLicenceRoutes(licenceService, communityService)
  const printHandler = new PrintLicenceRoutes(prisonerService, qrCodeService, licenceService)
  const comDetailsHandler = new ComDetailsRoutes(communityService)

  get('/cases', viewCasesHandler.GET)
  get('/cases-with-exclusions.json', viewCasesHandler.GET_WITH_EXCLUSIONS)
  get('/probation-practitioner/staffCode/:staffCode', comDetailsHandler.GET)
  get('/id/:licenceId/show', viewLicenceHandler.GET)
  get('/id/:licenceId/html-print', printHandler.preview)
  get('/id/:licenceId/pdf-print', printHandler.renderPdf)

  return router
}
