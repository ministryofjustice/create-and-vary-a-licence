import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PdfRoutes from './handlers/pdf'
import { Services } from '../../services'
import ViewAndPrintCaseRoutes from './handlers/viewCases'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import ViewAndPrintLicenceRoutes from './handlers/viewLicence'

export default function Index({ licenceService }: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/licence/view${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), fetchLicence(licenceService), asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler, type?: new () => unknown) =>
    router.post(routePrefix(path), validationMiddleware(type), asyncMiddleware(handler))

  // These are REAL routes
  const viewCasesHandler = new ViewAndPrintCaseRoutes(licenceService)
  const viewLicenceHandler = new ViewAndPrintLicenceRoutes(licenceService)

  get('/cases', viewCasesHandler.GET)
  post('/cases', viewCasesHandler.POST)
  get('/id/:licenceId/show', viewLicenceHandler.GET)
  post('/id/:licenceId/show', viewLicenceHandler.POST)

  // These are SPIKE routes
  const spikeGet = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const pdfHandlers = new PdfRoutes(licenceService)
  spikeGet('/licence/id/:id/pdf/preview', pdfHandlers.renderPdf)
  spikeGet('/licence/id/:id/preview', pdfHandlers.preview)

  return router
}
