import { RequestHandler, Router } from 'express'
import HomeRoutes from './handlers/home'
import ContactUsRoutes from './handlers/contactUs'
import AccessibilityStatementRoutes from './handlers/accessibilityStatement'
import WhatsNewController from '../whatsNewController/whatsNewController'
import { Services } from '../../services'
import RestrictedDetails from './handlers/restrictedDetails'

export default function Index({ licenceService }: Services): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  const homeHandler = new HomeRoutes()
  const contactUsHandler = new ContactUsRoutes()
  const accessibilityStatementHandler = new AccessibilityStatementRoutes()
  const whatsNewController = new WhatsNewController()
  const restrictedDetails = new RestrictedDetails(licenceService)

  get('/', homeHandler.GET)
  get('/contact', contactUsHandler.GET)
  get('/accessibility-statement', accessibilityStatementHandler.GET)
  get('/whats-new', whatsNewController.GET)
  get('/:crn/restricted', restrictedDetails.GET)
  return router
}
