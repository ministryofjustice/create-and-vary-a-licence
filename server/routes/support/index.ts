import { RequestHandler, Router } from 'express'
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
import LicenceDatesAndReason from './types/licenceDatesAndReason'

import ManageOmuEmailAddressHandler from './handlers/omuEmailAddress'
import OffenderLicenceStatusRoutes from './handlers/offenderLicenceStatus'
import OffenderLicenceDatesRoutes from './handlers/offenderLicenceDates'
import OffenderLicenceTypeRoutes from './handlers/offenderLicenceType'
import ProbationTeamRoutes from './handlers/probationTeam'
import ProbationUserRoutes from './handlers/probationStaff'
import ComDetailsRoutes from './handlers/comDetails'
import PromptCasesRoutes from './handlers/promptCases'
import LicenceTypeChange from './types/licenceTypeChange'

export default function Index({
  probationService,
  prisonerService,
  licenceService,
  prisonRegisterService,
  conditionService,
  licenceOverrideService,
  comCaseloadService,
  licenceApiClient,
}: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/support${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD']), handler)

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD']),
      validationMiddleware(conditionService, type),
      handler,
    )
  const supportHomeHandler = new SupportHomeRoutes()
  const offenderSearchHandler = new OffenderSearchRoutes(prisonerService, probationService)
  const offenderDetailHandler = new OffenderDetailRoutes(prisonerService, probationService, licenceService)
  const offenderLicenceHandler = new OffenderLicencesRoutes(licenceService)
  const offenderAuditHandler = new OffenderAuditRoutes(licenceService)
  const manageOmuEmailAddressHandler = new ManageOmuEmailAddressHandler(licenceService, prisonRegisterService)
  const offenderLicenceStatusHandler = new OffenderLicenceStatusRoutes(licenceService, licenceOverrideService)
  const offenderLicenceDatesHandler = new OffenderLicenceDatesRoutes(licenceService, licenceOverrideService)
  const offenderLicenceTypeHandler = new OffenderLicenceTypeRoutes(licenceService, licenceOverrideService)
  const probationTeamHandler = new ProbationTeamRoutes(comCaseloadService)
  const probationStaffHandler = new ProbationUserRoutes(comCaseloadService, probationService)
  const comDetailsHandler = new ComDetailsRoutes(probationService)
  const promptCasesHandler = new PromptCasesRoutes(licenceApiClient)

  get('/', supportHomeHandler.GET)
  get('/prompt-cases', promptCasesHandler.GET)
  get('/manage-omu-email-address', manageOmuEmailAddressHandler.GET)
  get('/manage-omu-email-address/:prisonId', manageOmuEmailAddressHandler.GET_IN_CONTEXT)
  post('/manage-omu-email-address/add-or-edit', manageOmuEmailAddressHandler.ADD_OR_EDIT, prisonIdAndEmail)
  post('/manage-omu-email-address/delete', manageOmuEmailAddressHandler.DELETE, prisonIdDelete)
  post('/manage-omu-email-address', manageOmuEmailAddressHandler.CURRENT, prisonIdCurrent)
  get('/offender-search', offenderSearchHandler.GET)
  get('/offender/:nomsId/detail', offenderDetailHandler.GET)
  get('/offender/:nomsId/licences', offenderLicenceHandler.GET)
  get('/offender/:nomsId/licence/:licenceId/audit', offenderAuditHandler.GET)
  get('/offender/:nomsId/licence/:licenceId/status', offenderLicenceStatusHandler.GET)
  post('/offender/:nomsId/licence/:licenceId/status', offenderLicenceStatusHandler.POST)
  get('/offender/:nomsId/licence/:licenceId/dates', offenderLicenceDatesHandler.GET)
  post('/offender/:nomsId/licence/:licenceId/dates', offenderLicenceDatesHandler.POST, LicenceDatesAndReason)
  get('/offender/:nomsId/licence/:licenceId/type', offenderLicenceTypeHandler.GET)
  post('/offender/:nomsId/licence/:licenceId/type', offenderLicenceTypeHandler.POST, LicenceTypeChange)
  get('/probation-teams/:teamCode/caseload', probationTeamHandler.GET)
  get('/probation-practitioner/:staffCode', comDetailsHandler.GET)
  get('/probation-practitioner/:staffCode/caseload', probationStaffHandler.GET)

  return router
}
