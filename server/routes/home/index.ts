import { RequestHandler, Router } from 'express'
import HomeRoutes from './handlers/home'
import AboutRoutes from './handlers/about'
import ContactUsRoutes from './handlers/contactUs'
import AccessibilityStatementRoutes from './handlers/accessibilityStatement'
import WhatsNewController from '../whatsNewController/whatsNewController'
import AccessRestrictedDeliusRoutes from './handlers/accessRestrictedDelius'
import { Services } from '../../services'

export default function Index({ licenceService }: Services): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  const homeHandler = new HomeRoutes()
  const aboutHandler = new AboutRoutes()
  const contactUsHandler = new ContactUsRoutes()
  const accessibilityStatementHandler = new AccessibilityStatementRoutes()
  const whatsNewController = new WhatsNewController()
  const accessRestrictedDelius = new AccessRestrictedDeliusRoutes(licenceService)

  get('/', homeHandler.GET)
  get('/about', aboutHandler.GET)
  get('/contact', contactUsHandler.GET)
  get('/accessibility-statement', accessibilityStatementHandler.GET)
  get('/whats-new', whatsNewController.GET)
  get('/crn/:crn/access-restricted-delius', accessRestrictedDelius.GET)

  return router
}
