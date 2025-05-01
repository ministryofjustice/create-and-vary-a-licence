import UserService from './userService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import ProbationService from './probationService'
import QrCodeService from './qrCodeService'
import CaseloadService from './lists/caseloadService'
import UkBankHolidayFeedService from './ukBankHolidayFeedService'
import PrisonRegisterService from './prisonRegisterService'
import ConditionService from './conditionService'
import LicenceOverrideService from './licenceOverrideService'
import { dataAccess } from '../data'
import SearchService from './searchService'
import FeComponentsService from './feComponentsService'
import ApproverCaseloadService from './lists/approverCaseloadService'
import TimelineService from './timelineService'
import CaCaseloadService from './lists/caCaseloadService'
import ComCaseloadService from './lists/comCaseloadService'
import HdcService from './hdcService'

const {
  manageUsersApiClient,
  prisonApiClient,
  prisonerSearchApiClient,
  deliusClient,
  licenceApiClient,
  prisonRegisterApiClient,
  feComponentsClient,
} = dataAccess()

const qrCodeService = new QrCodeService()
const prisonerService = new PrisonerService(prisonApiClient, prisonerSearchApiClient)
const probationService = new ProbationService(deliusClient)
const userService = new UserService(manageUsersApiClient, prisonApiClient, probationService)
const conditionService = new ConditionService(licenceApiClient)
const licenceService = new LicenceService(licenceApiClient, conditionService)
const ukBankHolidayFeedService = new UkBankHolidayFeedService()
const caseloadService = new CaseloadService(probationService, licenceService)
const caCaseloadService = new CaCaseloadService(licenceApiClient)
const comCaseloadService = new ComCaseloadService(licenceService, licenceApiClient)
const approvedCaseloadService = new ApproverCaseloadService(licenceApiClient)
const prisonRegisterService = new PrisonRegisterService(prisonRegisterApiClient)
const licenceOverrideService = new LicenceOverrideService(licenceApiClient)
const searchService = new SearchService(licenceApiClient)
const timelineService = new TimelineService(licenceApiClient)
const feComponentsService = new FeComponentsService(feComponentsClient)
const hdcService = new HdcService(licenceApiClient)

export const services = {
  userService,
  licenceService,
  approvedCaseloadService,
  caCaseloadService,
  comCaseloadService,
  caseloadService,
  prisonerService,
  probationService,
  qrCodeService,
  ukBankHolidayFeedService,
  prisonRegisterService,
  conditionService,
  licenceOverrideService,
  searchService,
  licenceApiClient,
  feComponentsService,
  timelineService,
  hdcService,
}

export type Services = typeof services
