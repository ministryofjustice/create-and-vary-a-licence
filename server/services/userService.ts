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

  // Users own token
  async getAuthUser(token: string): Promise<AuthUserDetails> {
    return this.hmppsAuthClient.getUser(token)
  }

  // Users own token
  async getAuthUserEmail(token: string): Promise<AuthUserEmail> {
    return this.hmppsAuthClient.getUserEmail(token)
  }

  // Users own token
  async getPrisonUser(token: string): Promise<PrisonApiUserDetail> {
    return this.prisonApiClient.getUser(token)
  }

  // Users own token
  async getPrisonUserCaseloads(token: string): Promise<PrisonApiCaseload[]> {
    return this.prisonApiClient.getUserCaseloads(token)
  }

  // Will use an admin token generated in the communityService
  async getProbationUser(deliusUsername: string): Promise<CommunityApiStaffDetails> {
    return this.communityService.getStaffDetail(deliusUsername)
  }
}
