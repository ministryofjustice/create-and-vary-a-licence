import ManageUsersApiClient, { PrisonUserDetails, PrisonUserEmail } from '../data/manageUsersApiClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'
import CommunityService from './communityService'
import { CommunityApiStaffDetails } from '../@types/communityClientTypes'
import { User } from '../@types/CvlUserDetails'

export default class UserService {
  constructor(
    private readonly manageUsersApiClient: ManageUsersApiClient,
    private readonly prisonApiClient: PrisonApiClient,
    private readonly communityService: CommunityService
  ) {}

  async getUser(user: User): Promise<PrisonUserDetails> {
    return this.manageUsersApiClient.getUser(user)
  }

  async getUserEmail(user: User): Promise<PrisonUserEmail> {
    return this.manageUsersApiClient.getUserEmail(user)
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
