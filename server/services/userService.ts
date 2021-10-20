import HmppsAuthClient, { AuthUserDetails, AuthUserEmail } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonApiCaseload, PrisonApiUserDetail } from '../@types/prisonApiClientTypes'

// The API calls in here are all made using the USER's token, not an ADMIN token - information accessible the user
// TODO: Add the community client and functions for probation user information

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient, private readonly prisonApiClient: PrisonApiClient) {}

  async getAuthUser(token: string): Promise<AuthUserDetails> {
    return this.hmppsAuthClient.getUser(token)
  }

  async getAuthUserEmail(token: string): Promise<AuthUserEmail> {
    return this.hmppsAuthClient.getUserEmail(token)
  }

  async getPrisonUser(token: string): Promise<PrisonApiUserDetail> {
    return this.prisonApiClient.getUser(token)
  }

  async getPrisonUserCaseloads(token: string): Promise<PrisonApiCaseload[]> {
    return this.prisonApiClient.getUserCaseloads(token)
  }
}
