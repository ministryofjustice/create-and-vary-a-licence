import { User } from '../../@types/CvlUserDetails'
import LicenceService from '../licenceService'
import type { ComCreateCase, ComReviewCount, ComVaryCase } from '../../@types/licenceApiClientTypes'
import { LicenceApiClient } from '../../data'

export default class ComCaseloadService {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly licenceApiClient: LicenceApiClient,
  ) {}

  public async getStaffCreateCaseload(user: User): Promise<ComCreateCase[]> {
    return this.licenceApiClient.getStaffCreateCaseload(user)
  }

  public async getTeamCreateCaseload(user: User, teamSelected: string[]): Promise<ComCreateCase[]> {
    return this.licenceApiClient.getTeamCreateCaseload(
      { probationTeamCodes: user.probationTeamCodes, teamSelected },
      user,
    )
  }

  async getStaffVaryCaseload(user: User): Promise<ComVaryCase[]> {
    return this.licenceApiClient.getStaffVaryCaseload(user)
  }

  async getTeamVaryCaseload(user: User, teamSelected?: string[]): Promise<ComVaryCase[]> {
    return this.licenceApiClient.getTeamVaryCaseload(
      {
        probationTeamCodes: user.probationTeamCodes,
        teamSelected,
      },
      user,
    )
  }

  async getComReviewCount(user: User): Promise<ComReviewCount> {
    return this.licenceService.getComReviewCount(user)
  }
}
