import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import HomeRoutes from './handlers/home'
import AboutRoutes from './handlers/about'
import ContactUsRoutes from './handlers/contactUs'
import AccessibilityStatementRoutes from './handlers/accessibilityStatement'
import WhatsNewController from '../whatsNewController/whatsNewController'

export default function Index(): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const homeHandler = new HomeRoutes()
  const aboutHandler = new AboutRoutes()
  const contactUsHandler = new ContactUsRoutes()
  const accessibilityStatementHandler = new AccessibilityStatementRoutes()
  const whatsNewController = new WhatsNewController()

  get('/', homeHandler.GET)
  get('/about', aboutHandler.GET)
  get('/contact', contactUsHandler.GET)
  get('/accessibility-statement', accessibilityStatementHandler.GET)
  get('/whats-new-page', whatsNewController.GET)

  return router
}
