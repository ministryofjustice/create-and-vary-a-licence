import {
  VaryApproverCaseloadSearchResponse,
  ApproverSearchResponse,
  PrisonCaseAdminSearchResult,
  ComSearchResponse,
} from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import { User } from '../@types/CvlUserDetails'

export default class SearchService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getComSearchResponses(queryTerm: string, user: User): Promise<ComSearchResponse> {
    return this.licenceApiClient.searchForOffenderOnStaffCaseload(
      {
        query: queryTerm,
        staffIdentifier: user.deliusStaffIdentifier,
        sortBy: [],
      },
      user,
    )
  }

  async getCaSearchResults(queryTerm: string, prisonCaseloads: string[]): Promise<PrisonCaseAdminSearchResult> {
    return this.licenceApiClient.searchForOffenderOnPrisonCaseAdminCaseload({
      query: queryTerm,
      prisonCaseloads,
    })
  }

  async getPrisonApproverSearchResults(queryTerm: string, prisonCaseloads: string[]): Promise<ApproverSearchResponse> {
    return this.licenceApiClient.searchForOffenderOnApproverCaseload({
      prisonCaseloads,
      query: queryTerm,
    })
  }

  async getVaryApproverSearchResults(user: User, queryTerm: string): Promise<VaryApproverCaseloadSearchResponse> {
    return this.licenceApiClient.searchForOffenderOnVaryApproverCaseload({
      probationPduCodes: user.probationPduCodes,
      probationAreaCode: user.probationAreaCode,
      searchTerm: queryTerm,
    })
  }
}
