import UserService from './userService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import CommunityService from './communityService'
import QrCodeService from './qrCodeService'
import CaseloadService from './caseloadService'
import UkBankHolidayFeedService from './ukBankHolidayFeedService'
import PrisonRegisterService from './prisonRegisterService'
import ConditionService from './conditionService'
import LicenceOverrideService from './licenceOverrideService'
import { dataAccess } from '../data'
import SearchService from './searchService'
import FeComponentsService from './feComponentsService'
import ApproverCaseloadService from './approverCaseloadService'

const {
  manageUsersApiClient,
  prisonApiClient,
  prisonerSearchApiClient,
  communityApiClient,
  probationSearchApiClient,
  licenceApiClient,
  prisonRegisterApiClient,
  feComponentsClient,
} = dataAccess()

const qrCodeService = new QrCodeService()
const prisonerService = new PrisonerService(prisonApiClient, prisonerSearchApiClient)
const communityService = new CommunityService(communityApiClient, probationSearchApiClient)
const userService = new UserService(manageUsersApiClient, prisonApiClient, communityService)
const conditionService = new ConditionService(licenceApiClient)
const licenceService = new LicenceService(licenceApiClient, conditionService)
const ukBankHolidayFeedService = new UkBankHolidayFeedService()
const caseloadService = new CaseloadService(prisonerService, communityService, licenceService, ukBankHolidayFeedService)
const approvedCaseloadService = new ApproverCaseloadService(prisonerService, communityService, licenceApiClient)
const prisonRegisterService = new PrisonRegisterService(prisonRegisterApiClient)
const licenceOverrideService = new LicenceOverrideService(licenceApiClient)
const searchService = new SearchService(licenceApiClient)
const feComponentsService = new FeComponentsService(feComponentsClient)

export const services = {
  userService,
  licenceService,
  approvedCaseloadService,
  caseloadService,
  prisonerService,
  communityService,
  qrCodeService,
  ukBankHolidayFeedService,
  prisonRegisterService,
  conditionService,
  licenceOverrideService,
  searchService,
  licenceApiClient,
  feComponentsService,
}

export type Services = typeof services
