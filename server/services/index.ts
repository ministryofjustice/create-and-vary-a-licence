import UserService from './userService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import CommunityService from './communityService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import CaseloadService from './caseloadService'
import PrisonApiClient from '../data/prisonApiClient'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const prisonerService = new PrisonerService(hmppsAuthClient)
const communityService = new CommunityService(hmppsAuthClient)

const prisonApiClient = new PrisonApiClient()
const userService = new UserService(hmppsAuthClient, prisonApiClient, communityService)

const licenceService = new LicenceService(hmppsAuthClient, prisonerService, communityService)
const caseloadService = new CaseloadService(prisonerService, communityService, licenceService)

// TODO - Remove prisonerService and community service as exports
// The following services should not be exported eventually (after spikes have been removed), they should only ever be consumed by the caseload service.
// CaseloadService is a one stop shop for a combination of data from DELIUS and NOMIS

export const services = {
  userService,
  licenceService,
  caseloadService,
  prisonerService,
  communityService,
}

export type Services = typeof services
