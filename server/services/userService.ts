import HmppsAuthClient, { AuthUserDetails, AuthUserEmail } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'
import CommunityService from './communityService'
import { CommunityApiStaffDetails } from '../@types/communityClientTypes'
import { User } from '../@types/CvlUserDetails'

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly prisonApiClient: PrisonApiClient,
    private readonly communityService: CommunityService
  ) {}

  async getAuthUser(user: User): Promise<AuthUserDetails> {
    return this.hmppsAuthClient.getUser(user)
  }

  async getAuthUserEmail(user: User): Promise<AuthUserEmail> {
    return this.hmppsAuthClient.getUserEmail(user)
  }

  async getPrisonUser(user: User): Promise<PrisonApiUserDetail> {
    return this.prisonApiClient.getUser(user)
  }

  async getPrisonUserCaseloads(user: User): Promise<PrisonApiCaseload[]> {
    return this.prisonApiClient.getUserCaseloads(user)
  }

  async getProbationUser(user: User): Promise<CommunityApiStaffDetails> {
    return this.communityService.getStaffDetailByUsername(user.username)
  }
}
