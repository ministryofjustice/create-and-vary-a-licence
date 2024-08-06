import { User } from '../../@types/CvlUserDetails'
import LicenceService from '../licenceService'
import type { ComCase, ComReviewCount } from '../../@types/licenceApiClientTypes'
import { LicenceApiClient } from '../../data'

export default class ComCaseloadService {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly licenceApiClient: LicenceApiClient
  ) {}

  public async getStaffCreateCaseload(user: User): Promise<ComCase[]> {
    return this.licenceApiClient.getStaffCreateCaseload(user.deliusStaffIdentifier)
  }

  public async getTeamCreateCaseload(user: User, teamSelected: string[]): Promise<ComCase[]> {
    return this.licenceApiClient.getTeamCreateCaseload({ probationTeamCodes: user.probationTeamCodes, teamSelected })
  }

  async getStaffVaryCaseload(user: User): Promise<ComCase[]> {
    return this.licenceApiClient.getStaffVaryCaseload(user.deliusStaffIdentifier)
  }

  async getTeamVaryCaseload(user: User, teamSelected?: string[]): Promise<ComCase[]> {
    return this.licenceApiClient.getTeamVaryCaseload({ probationTeamCodes: user.probationTeamCodes, teamSelected })
  }

  async getComReviewCount(user: User): Promise<ComReviewCount> {
    return this.licenceService.getComReviewCount(user)
  }
}
