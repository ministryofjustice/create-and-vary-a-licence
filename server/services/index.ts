import UserService from './userService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import CommunityService from './communityService'
import QrCodeService from './qrCodeService'
import CaseloadService from './caseloadService'
import UkBankHolidayFeedService from './ukBankHolidayFeedService'
import LicenceExpiryService from './licenceExpiryService'
import PrisonRegisterService from './prisonRegisterService'
import ConditionService from './conditionService'
import LicenceOverrideService from './licenceOverrideService'
import { dataAccess } from '../data'

const {
  hmppsAuthClient,
  prisonApiClient,
  prisonerSearchApiClient,
  communityApiClient,
  probationSearchApiClient,
  licenceApiClient,
  prisonRegisterApiClient,
} = dataAccess()

const qrCodeService = new QrCodeService()
const prisonerService = new PrisonerService(prisonApiClient, prisonerSearchApiClient)
const communityService = new CommunityService(communityApiClient, probationSearchApiClient)
const userService = new UserService(hmppsAuthClient, prisonApiClient, communityService)
const conditionService = new ConditionService(licenceApiClient)
const licenceService = new LicenceService(licenceApiClient, prisonerService, communityService, conditionService)
const caseloadService = new CaseloadService(prisonerService, communityService, licenceService)
const licenceExpiryService = new LicenceExpiryService(prisonerService, licenceApiClient, licenceService)
const ukBankHolidayFeedService = new UkBankHolidayFeedService()
const prisonRegisterService = new PrisonRegisterService(prisonRegisterApiClient)
const licenceOverrideService = new LicenceOverrideService(licenceApiClient)

export const services = {
  userService,
  licenceService,
  caseloadService,
  prisonerService,
  communityService,
  qrCodeService,
  ukBankHolidayFeedService,
  licenceExpiryService,
  prisonRegisterService,
  conditionService,
  licenceOverrideService,
  licenceApiClient,
}

export type Services = typeof services
