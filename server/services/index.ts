import UserService from './userService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import CommunityService from './communityService'
import QrCodeService from './qrCodeService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import CaseloadService from './caseloadService'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import CommunityApiClient from '../data/communityApiClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import LicenceApiClient from '../data/licenceApiClient'
import UkBankHolidayFeedService from './ukBankHolidayFeedService'
import LicenceExpiryService from './licenceExpiryService'

const hmppsAuthClient = new HmppsAuthClient()
const prisonApiClient = new PrisonApiClient()
const prisonerSearchApiClient = new PrisonerSearchApiClient()
const communityApiClient = new CommunityApiClient()
const probationSearchApiClient = new ProbationSearchApiClient()
const licenceApiClient = new LicenceApiClient()

const qrCodeService = new QrCodeService()
const prisonerService = new PrisonerService(prisonApiClient, prisonerSearchApiClient)
const communityService = new CommunityService(communityApiClient, probationSearchApiClient)
const userService = new UserService(hmppsAuthClient, prisonApiClient, communityService)
const licenceService = new LicenceService(licenceApiClient, prisonerService, communityService)
const caseloadService = new CaseloadService(prisonerService, communityService, licenceService)
const licenceExpiryService = new LicenceExpiryService(prisonerService, licenceApiClient, licenceService)
const ukBankHolidayFeedService = new UkBankHolidayFeedService()

// TODO - Remove prisonerService and community service as exports
// The following services should not be exported eventually (after spikes have been removed), they should only ever be consumed by the caseload service.
// CaseloadService is a one stop shop for a combination of data from DELIUS and NOMIS

export const services = {
  userService,
  licenceService,
  caseloadService,
  prisonerService,
  communityService,
  qrCodeService,
  ukBankHolidayFeedService,
  licenceExpiryService,
}

export type Services = typeof services
