import { type RequestHandler, Router } from 'express'

import type { Services } from '../../services'

import prisonIdCurrent from './types/prisonIdCurrent'
import prisonIdAndEmail from './types/prisonIdAndEmail'
import prisonIdDelete from './types/prisonIdDelete'
import LicenceDatesAndReason from './types/licenceDatesAndReason'

import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'

import SupportHomeRoutes from './handlers/supportHome'
import OffenderSearchRoutes from './handlers/offenderSearch'
import OffenderDetailRoutes from './handlers/offenderDetail'
import OffenderAuditRoutes from './handlers/offenderAudit'
import OffenderLicencesRoutes from './handlers/offenderLicences'
import ManageOmuEmailAddressRoutes from './handlers/omuEmailAddress'
import OffenderLicenceStatusRoutes from './handlers/offenderLicenceStatus'
import OffenderLicenceDatesRoutes from './handlers/offenderLicenceDates'
import ProbationTeamRoutes from './handlers/probationTeam'
import ProbationUserRoutes from './handlers/probationStaff'
import ComDetailsRoutes from './handlers/comDetails'
import LicencePrisonerDetails from './types/licencePrisonerDetails'
import LicencePrisonerDetailsRoutes from './handlers/licencePrisonerDetails'
import AuditDetailsRoutes from './handlers/auditDetails'
import VaryApproverPduCaseloadRoutes from './handlers/varyApproverPduCaseload'
import VaryApproverRegionCaseloadRoutes from './handlers/varyApproverRegionCaseload'
import OffenderAllocationRoutes from './handlers/offenderAllocation'

export default function Index({
  probationService,
  prisonerService,
  licenceService,
  prisonRegisterService,
  conditionService,
  licenceOverrideService,
  comCaseloadService,
  varyApproverCaseloadService,
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
  get('/', supportHomeHandler.GET)

  // Manage OMU email addresses
  const manageOmuEmailAddressHandler = new ManageOmuEmailAddressRoutes(licenceService, prisonRegisterService)
  get('/manage-omu-email-address', manageOmuEmailAddressHandler.GET)
  get('/manage-omu-email-address/:prisonId', manageOmuEmailAddressHandler.GET_IN_CONTEXT)
  post('/manage-omu-email-address/add-or-edit', manageOmuEmailAddressHandler.ADD_OR_EDIT, prisonIdAndEmail)
  post('/manage-omu-email-address/delete', manageOmuEmailAddressHandler.DELETE, prisonIdDelete)
  post('/manage-omu-email-address', manageOmuEmailAddressHandler.CURRENT, prisonIdCurrent)

  // COM details and caselists
  const comDetailsHandler = new ComDetailsRoutes(probationService)
  const probationTeamHandler = new ProbationTeamRoutes(comCaseloadService)
  const probationStaffHandler = new ProbationUserRoutes(comCaseloadService, probationService)
  get('/probation-teams/:teamCode/caseload', probationTeamHandler.GET)
  get('/probation-practitioner/:staffCode', comDetailsHandler.GET)
  get('/probation-practitioner/:staffCode/caseload', probationStaffHandler.GET)

  // Case details
  const offenderSearchHandler = new OffenderSearchRoutes(prisonerService, probationService)
  const offenderDetailHandler = new OffenderDetailRoutes(prisonerService, probationService, licenceService)
  const offenderLicenceHandler = new OffenderLicencesRoutes(licenceService)
  const offenderAuditHandler = new OffenderAuditRoutes(licenceService)
  const auditDetailsHandler = new AuditDetailsRoutes(licenceService)
  get('/offender-search', offenderSearchHandler.GET)
  get('/offender/:nomsId/detail', offenderDetailHandler.GET)
  get('/offender/:nomsId/licences', offenderLicenceHandler.GET)
  get('/offender/:nomsId/licence/:licenceId/audit', offenderAuditHandler.GET)
  get('/offender/:nomsId/licence/:licenceId/audit/:auditEventId', auditDetailsHandler.GET)

  // View / update Licence status
  const offenderLicenceStatusHandler = new OffenderLicenceStatusRoutes(licenceService, licenceOverrideService)
  get('/offender/:nomsId/licence/:licenceId/status', offenderLicenceStatusHandler.GET)
  post('/offender/:nomsId/licence/:licenceId/status', offenderLicenceStatusHandler.POST)

  // View / update licence dates
  const offenderLicenceDatesHandler = new OffenderLicenceDatesRoutes(licenceService, licenceOverrideService)
  get('/offender/:nomsId/licence/:licenceId/dates', offenderLicenceDatesHandler.GET)
  post('/offender/:nomsId/licence/:licenceId/dates', offenderLicenceDatesHandler.POST, LicenceDatesAndReason)

  // View / update Prisoner details
  const licencePrisonerDetailsHandler = new LicencePrisonerDetailsRoutes(licenceService, licenceOverrideService)
  get('/offender/:nomsId/licence/:licenceId/prisoner-details', licencePrisonerDetailsHandler.GET)
  post(
    '/offender/:nomsId/licence/:licenceId/prisoner-details',
    licencePrisonerDetailsHandler.POST,
    LicencePrisonerDetails,
  )

  // View / update allocation
  const offenderAllocationHandler = new OffenderAllocationRoutes(licenceService, probationService)
  get('/offender/:nomsId/allocation', offenderAllocationHandler.GET)
  post('/offender/:nomsId/allocation', offenderAllocationHandler.POST)

  // get vary approver case load by pdu and region
  const varyApproverRegionCaseloadHandler = new VaryApproverRegionCaseloadRoutes(
    probationService,
    varyApproverCaseloadService,
  )
  const varyApproverPduCaseloadHandler = new VaryApproverPduCaseloadRoutes(
    probationService,
    varyApproverCaseloadService,
  )
  get('/variation-approver/cases/by-pdu', varyApproverPduCaseloadHandler.GET)
  get('/variation-approver/cases/by-region', varyApproverRegionCaseloadHandler.GET)

  return router
}
