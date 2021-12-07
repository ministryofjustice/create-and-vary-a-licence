import CommunityApiClient from '../data/communityApiClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import { OffenderDetail, SearchDto } from '../@types/probationSearchApiClientTypes'
import { CommunityApiManagedOffender, CommunityApiStaffDetails } from '../@types/communityClientTypes'

export default class CommunityService {
  constructor(
    private readonly communityApiClient: CommunityApiClient,
    private readonly probationSearchApiClient: ProbationSearchApiClient
  ) {}

  async getStaffDetail(deliusUsername: string): Promise<CommunityApiStaffDetails> {
    return this.communityApiClient.getStaffDetailByUsername(deliusUsername)
  }

  async getManagedOffenders(staffIdentifier: number): Promise<CommunityApiManagedOffender[]> {
    return this.communityApiClient.getStaffCaseload(staffIdentifier)
  }

  async searchProbationers(searchCriteria: SearchDto): Promise<OffenderDetail[]> {
    return this.probationSearchApiClient.searchProbationer(searchCriteria)
  }

  async getProbationer(nomisId: string): Promise<OffenderDetail> {
    const deliusRecords = await this.probationSearchApiClient.searchProbationer({ nomsNumber: nomisId })
    if (deliusRecords.length < 1) {
      throw new Error(`No delius record found for nomis ID ${nomisId}`)
    }
    return deliusRecords[0]
  }
}
