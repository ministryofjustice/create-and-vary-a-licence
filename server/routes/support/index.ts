import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import SupportHomeRoutes from './handlers/supportHome'
import { Services } from '../../services'
import OffenderSearchRoutes from './handlers/offenderSearch'
import OffenderDetailRoutes from './handlers/offenderDetail'
import OffenderAuditRoutes from './handlers/offenderAudit'
import OffenderLicencesRoutes from './handlers/offenderLicences'

export default function Index({ communityService, prisonerService, licenceService }: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/support${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD']), asyncMiddleware(handler))

  const supportHomeHandler = new SupportHomeRoutes()
  const offenderSearchHandler = new OffenderSearchRoutes(prisonerService, communityService)
  const offenderDetailHandler = new OffenderDetailRoutes(prisonerService, communityService)
  const offenderLicenceHandler = new OffenderLicencesRoutes(licenceService, prisonerService)
  const offenderAuditHandler = new OffenderAuditRoutes(licenceService, prisonerService)

  get('/', supportHomeHandler.GET)
  get('/offender-search', offenderSearchHandler.GET)
  get('/offender/:nomsId/detail', offenderDetailHandler.GET)
  get('/offender/:nomsId/licences', offenderLicenceHandler.GET)
  get('/offender/:nomsId/licence/:licenceId/audit', offenderAuditHandler.GET)

  return router
}
