import ManageUsersApiClient, { UserDetails, UserEmail } from '../data/manageUsersApiClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'
import ProbationService from './probationService'
import { DeliusStaff } from '../@types/deliusClientTypes'
import { User } from '../@types/CvlUserDetails'

export default class UserService {
  constructor(
    private readonly manageUsersApiClient: ManageUsersApiClient,
    private readonly prisonApiClient: PrisonApiClient,
    private readonly probationService: ProbationService,
  ) {}

  async getUser(user: User): Promise<UserDetails> {
    return this.manageUsersApiClient.getUser(user)
  }

  async getUserEmail(user: User): Promise<UserEmail> {
    return this.manageUsersApiClient.getUserEmail(user)
  }

  async getPrisonUser(user: User): Promise<PrisonApiUserDetail> {
    return this.prisonApiClient.getUser(user)
  }

  async getPrisonUserCaseloads(user: User): Promise<PrisonApiCaseload[]> {
    return this.prisonApiClient.getUserCaseloads(user)
  }

  async getProbationUser(user: User): Promise<DeliusStaff> {
    return this.probationService.getStaffDetailByUsername(user.username)
  }
}
