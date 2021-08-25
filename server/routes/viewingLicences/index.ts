import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PdfRoutes from './handlers/pdf'
import { Services } from '../../services'

export default function Index({ licenceService }: Services): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const pdfHandlers = new PdfRoutes(licenceService)

  get('/licence/id/:id/pdf/preview', pdfHandlers.renderPdf)
  get('/licence/id/:id/preview', pdfHandlers.preview)

  return router
}
