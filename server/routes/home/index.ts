import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import HomeRoutes from './handlers/home'
import AboutRoutes from './handlers/about'
import ContactUsRoutes from './handlers/contactUs'
import AccessibilityStatementRoutes from './handlers/accessibilityStatement'
import WhatsNewController from '../whatsNewController/whatsNewController'
import ActivateVaryLicenceReminderController from '../activateVaryLicenceReminderController/activateVaryLicenceReminderController'

export default function Index(): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const homeHandler = new HomeRoutes()
  const aboutHandler = new AboutRoutes()
  const contactUsHandler = new ContactUsRoutes()
  const accessibilityStatementHandler = new AccessibilityStatementRoutes()
  const whatsNewController = new WhatsNewController()
  const activateVaryLicenceReminderController = new ActivateVaryLicenceReminderController()

  get('/', homeHandler.GET)
  get('/about', aboutHandler.GET)
  get('/contact', contactUsHandler.GET)
  get('/accessibility-statement', accessibilityStatementHandler.GET)
  get('/whats-new-page', whatsNewController.GET)
  get('/activating-a-licence-after-a-variation', activateVaryLicenceReminderController.GET)

  return router
}
