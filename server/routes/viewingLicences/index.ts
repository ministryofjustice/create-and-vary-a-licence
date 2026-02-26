import { RequestHandler, Router } from 'express'
import { Services } from '../../services'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import ViewAndPrintCaseRoutes from './handlers/viewCases'
import ViewAndPrintLicenceRoutes from './handlers/viewLicence'
import PrintLicenceRoutes from './handlers/printLicence'
import ComDetailsRoutes from './handlers/comDetails'
import checkComCaseAccessMiddleware from '../../middleware/checkComCaseAccessMiddleware'

export default function Index({
  licenceService,
  prisonerService,
  probationService,
  caCaseloadService,
  qrCodeService,
  hdcService,
}: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/licence/view${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_RO', 'ROLE_LICENCE_DM']),
      checkComCaseAccessMiddleware(licenceService),
      fetchLicence(licenceService),
      handler,
    )

  const viewCasesHandler = new ViewAndPrintCaseRoutes(caCaseloadService, prisonerService)
  const viewLicenceHandler = new ViewAndPrintLicenceRoutes(licenceService, hdcService)
  const printHandler = new PrintLicenceRoutes(prisonerService, qrCodeService, licenceService, hdcService)
  const comDetailsHandler = new ComDetailsRoutes(probationService)

  get('/cases', viewCasesHandler.GET)
  get('/probation-practitioner/staffCode/:staffCode', comDetailsHandler.GET)
  get('/id/:licenceId/show', viewLicenceHandler.GET)
  get('/id/:licenceId/html-print', printHandler.preview)
  get('/id/:licenceId/pdf-print', printHandler.renderPdf)

  return router
}
