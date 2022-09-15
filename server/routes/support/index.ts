import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import SupportHomeRoutes from './handlers/supportHome'
import { Services } from '../../services'
import OffenderSearchRoutes from './handlers/offenderSearch'
import OffenderDetailRoutes from './handlers/offenderDetail'
import OffenderAuditRoutes from './handlers/offenderAudit'
import OffenderLicencesRoutes from './handlers/offenderLicences'
import validationMiddleware from '../../middleware/validationMiddleware'
import PrisonIdCurrent from './types/prisonIdCurrent'
import PrisonIdAndEmail from './types/prisonIdAndEmail'
import PrisonIdDelete from './types/prisonIdDelete'
import DateRange from './types/dateRange'
import ManageOmuEmailAddressHandler from './handlers/omuEmailAddress'
import LicenceStatistics from './handlers/licenceStatistics'

export default function Index({
  communityService,
  prisonerService,
  licenceService,
  prisonRegisterService,
}: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/support${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD']), asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD']),
      validationMiddleware(type),
      asyncMiddleware(handler)
    )
  const supportHomeHandler = new SupportHomeRoutes()
  const offenderSearchHandler = new OffenderSearchRoutes(prisonerService, communityService)
  const offenderDetailHandler = new OffenderDetailRoutes(prisonerService, communityService)
  const offenderLicenceHandler = new OffenderLicencesRoutes(licenceService, prisonerService)
  const offenderAuditHandler = new OffenderAuditRoutes(licenceService, prisonerService)
  const manageOmuEmailAddressHandler = new ManageOmuEmailAddressHandler(licenceService, prisonRegisterService)
  const licenceStatistics = new LicenceStatistics(licenceService)

  get('/', supportHomeHandler.GET)
  get('/manage-omu-email-address', manageOmuEmailAddressHandler.GET)
  post('/manage-omu-email-address/add-or-edit', manageOmuEmailAddressHandler.ADD_OR_EDIT, PrisonIdAndEmail)
  post('/manage-omu-email-address/delete', manageOmuEmailAddressHandler.DELETE, PrisonIdDelete)
  post('/manage-omu-email-address', manageOmuEmailAddressHandler.CURRENT, PrisonIdCurrent)
  get('/offender-search', offenderSearchHandler.GET)
  get('/offender/:nomsId/detail', offenderDetailHandler.GET)
  get('/offender/:nomsId/licences', offenderLicenceHandler.GET)
  get('/offender/:nomsId/licence/:licenceId/audit', offenderAuditHandler.GET)
  get('/licence-statistics', licenceStatistics.GET)
  post('/licence-statistics', licenceStatistics.POST, DateRange)

  return router
}
