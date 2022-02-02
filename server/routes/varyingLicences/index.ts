import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import CaseloadRoutes from './handlers/caseload'
import { Services } from '../../services'
import ViewActiveLicenceRoutes from './handlers/viewActiveLicence'
import ComDetailsRoutes from './handlers/comDetails'

export default function Index({ licenceService, caseloadService, communityService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/vary${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      asyncMiddleware(handler)
    )

  const caseloadHandler = new CaseloadRoutes(caseloadService)
  const comDetailsHandler = new ComDetailsRoutes(communityService)
  const viewLicenceHandler = new ViewActiveLicenceRoutes()

  get('/caseload', caseloadHandler.GET)
  get('/id/:licenceId/probation-practitioner', comDetailsHandler.GET)
  get('/id/:licenceId/view', viewLicenceHandler.GET)

  return router
}
