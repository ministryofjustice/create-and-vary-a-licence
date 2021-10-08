import UserService from './userService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import CommunityService from './communityService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import CaseloadService from './caseloadService'
import PrisonRegisterService from './prisonRegisterService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const prisonerService = new PrisonerService(hmppsAuthClient)
const prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
const communityService = new CommunityService(hmppsAuthClient)
const licenceService = new LicenceService(hmppsAuthClient, prisonerService, communityService, prisonRegisterService)
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
