import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { Services } from '../../services'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import ViewAndPrintCaseRoutes from './handlers/viewCases'
import ViewAndPrintLicenceRoutes from './handlers/viewLicence'
import PrintLicenceRoutes from './handlers/printLicence'

export default function Index({ licenceService, prisonerService }: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/licence/view${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), fetchLicence(licenceService), asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler, type?: new () => unknown) =>
    router.post(routePrefix(path), fetchLicence(licenceService), validationMiddleware(type), asyncMiddleware(handler))

  const viewCasesHandler = new ViewAndPrintCaseRoutes(licenceService)
  const viewLicenceHandler = new ViewAndPrintLicenceRoutes()
  const printHandler = new PrintLicenceRoutes(prisonerService)

  get('/cases', viewCasesHandler.GET)
  post('/cases', viewCasesHandler.POST)
  get('/id/:licenceId/show', viewLicenceHandler.GET)
  get('/id/:licenceId/html-print', printHandler.preview)
  get('/id/:licenceId/pdf-print', printHandler.renderPdf)

  return router
}
