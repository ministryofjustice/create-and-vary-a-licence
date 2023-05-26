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
import prisonIdCurrent from './types/prisonIdCurrent'
import prisonIdAndEmail from './types/prisonIdAndEmail'
import prisonIdDelete from './types/prisonIdDelete'
import ManageOmuEmailAddressHandler from './handlers/omuEmailAddress'
import OffenderLicenceStatusRoutes from './handlers/offenderLicenceStatus'
import ProbationerSearchRoutes from './handlers/probationerSearch'
import ProbationerUserSearchRoutes from './handlers/probationerUserSearch'

export default function Index({
  communityService,
  prisonerService,
  caseloadService,
  userService,
  licenceService,
  prisonRegisterService,
  conditionService,
  licenceOverrideService,
}: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/support${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD']), asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD']),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )
  const supportHomeHandler = new SupportHomeRoutes()
  const offenderSearchHandler = new OffenderSearchRoutes(prisonerService, communityService)
  const probationerSearchHandler = new ProbationerSearchRoutes(userService, caseloadService, communityService)
  const probationerUserSearchHandler = new ProbationerUserSearchRoutes(caseloadService, communityService)
  const offenderDetailHandler = new OffenderDetailRoutes(prisonerService, communityService, licenceService)
  const offenderLicenceHandler = new OffenderLicencesRoutes(licenceService, prisonerService)
  const offenderAuditHandler = new OffenderAuditRoutes(licenceService, prisonerService)
  const manageOmuEmailAddressHandler = new ManageOmuEmailAddressHandler(licenceService, prisonRegisterService)
  const offenderLicenceStatusHandler = new OffenderLicenceStatusRoutes(licenceService, licenceOverrideService)

  get('/', supportHomeHandler.GET)
  get('/manage-omu-email-address', manageOmuEmailAddressHandler.GET)
  post('/manage-omu-email-address/add-or-edit', manageOmuEmailAddressHandler.ADD_OR_EDIT, prisonIdAndEmail)
  post('/manage-omu-email-address/delete', manageOmuEmailAddressHandler.DELETE, prisonIdDelete)
  post('/manage-omu-email-address', manageOmuEmailAddressHandler.CURRENT, prisonIdCurrent)
  get('/offender-search', offenderSearchHandler.GET)
  get('/offender/:nomsId/detail', offenderDetailHandler.GET)
  get('/offender/:nomsId/licences', offenderLicenceHandler.GET)
  get('/offender/:nomsId/licence/:licenceId/audit', offenderAuditHandler.GET)
  get('/offender/:nomsId/licence/:licenceId/status', offenderLicenceStatusHandler.GET)
  post('/offender/:nomsId/licence/:licenceId/status', offenderLicenceStatusHandler.POST)
  get('/probationer-search', probationerSearchHandler.GET)
  get('/probationer-user-search/:teamName/:teamCode/:deliusStaffIdentifier', probationerUserSearchHandler.GET)

  return router
}
