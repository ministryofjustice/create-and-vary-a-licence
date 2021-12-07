import HmppsAuthClient, { AuthUserDetails, AuthUserEmail } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'
import CommunityService from './communityService'
import { CommunityApiStaffDetails } from '../@types/communityClientTypes'

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly prisonApiClient: PrisonApiClient,
    private readonly communityService: CommunityService
  ) {}

  async getAuthUser(username: string): Promise<AuthUserDetails> {
    return this.hmppsAuthClient.getUser(username)
  }

  async getAuthUserEmail(username: string): Promise<AuthUserEmail> {
    return this.hmppsAuthClient.getUserEmail(username)
  }

  async getPrisonUser(username: string): Promise<PrisonApiUserDetail> {
    return this.prisonApiClient.getUser(username)
  }

  async getPrisonUserCaseloads(username: string): Promise<PrisonApiCaseload[]> {
    return this.prisonApiClient.getUserCaseloads(username)
  }

  async getProbationUser(deliusUsername: string): Promise<CommunityApiStaffDetails> {
    return this.communityService.getStaffDetail(deliusUsername)
  }
}
