import { User } from '../../@types/CvlUserDetails'
import type { VaryApproverCase } from '../../@types/licenceApiClientTypes'
import type LicenceApiClient from '../../data/licenceApiClient'

export default class VaryApproverCaseloadService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getVaryApproverCaseload(user: User, searchTerm: string): Promise<VaryApproverCase[]> {
    return this.licenceApiClient.getVaryApproverCaseload(
      {
        probationPduCodes: user.probationPduCodes,
        searchTerm,
      },
      user,
    )
  }

  async getVaryApproverCaseloadByRegion(user: User, searchTerm: string): Promise<VaryApproverCase[]> {
    return this.licenceApiClient.getVaryApproverCaseload(
      {
        probationAreaCode: user.probationAreaCode,
        searchTerm,
      },
      user,
    )
  }
}
