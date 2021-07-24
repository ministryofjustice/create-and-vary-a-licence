import UserService from './userService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import CommunityService from './communityService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const prisonerService = new PrisonerService(hmppsAuthClient)
const licenceService = new LicenceService(hmppsAuthClient)
const communityService = new CommunityService(hmppsAuthClient)

export const services = {
  userService,
  prisonerService,
  licenceService,
  communityService,
}

export type Services = typeof services
