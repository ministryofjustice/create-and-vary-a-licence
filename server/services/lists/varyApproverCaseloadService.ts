import { format } from 'date-fns'
import { User } from '../../@types/CvlUserDetails'
import type { VaryApproverCase } from '../../@types/licenceApiClientTypes'
import { parseCvlDate } from '../../utils/utils'
import { LicenceApiClient } from '../../data'

export default class VaryApproverCaseloadService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getVaryApproverCaseload(user: User, searchTerm: string): Promise<VaryApproverCase[]> {
    return (
      await this.licenceApiClient.getVaryApproverCaseload({
        probationPduCodes: user.probationPduCodes,
        searchTerm,
      })
    ).map(this.mapToCaseView)
  }

  async getVaryApproverCaseloadByRegion(user: User, searchTerm: string): Promise<VaryApproverCase[]> {
    return (
      await this.licenceApiClient.getVaryApproverCaseload({
        probationAreaCode: user.probationAreaCode,
        searchTerm,
      })
    ).map(this.mapToCaseView)
  }

  private mapToCaseView(aCase: VaryApproverCase) {
    return {
      ...aCase,
      releaseDate: format(parseCvlDate(aCase.releaseDate), 'dd MMM yyyy'),
      variationRequestDate: format(parseCvlDate(aCase.variationRequestDate), 'dd MMM yyyy'),
    }
  }
}
