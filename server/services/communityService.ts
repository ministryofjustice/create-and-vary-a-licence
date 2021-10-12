import type HmppsAuthClient from '../data/hmppsAuthClient'
import CommunityApiClient from '../data/communityApiClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import { OffenderDetail, SearchDto } from '../@types/probationSearchApiClientTypes'
import { CommunityApiManagedOffender, CommunityApiStaffDetails } from '../@types/communityClientTypes'

export default class CommunityService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getStaffDetail(deliusUsername: string): Promise<CommunityApiStaffDetails> {
    // Important: No username is passed into the getSystemClientToken for the community API
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return new CommunityApiClient(token).getStaffDetailByUsername(deliusUsername)
  }

  async getManagedOffenders(staffIdentifier: number): Promise<CommunityApiManagedOffender[]> {
    // Important: No username is passed into the getSystemClientToken for the community API
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return new CommunityApiClient(token).getStaffCaseload(staffIdentifier)
  }

  async searchProbationers(searchCriteria: SearchDto): Promise<OffenderDetail[]> {
    // Important: No username is passed into the getSystemClientToken for the community search API
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return new ProbationSearchApiClient(token).searchProbationer(searchCriteria)
  }

  async getProbationer(nomisId: string): Promise<OffenderDetail> {
    // Important: No username is passed into the getSystemClientToken for the community search API
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const deliusRecords = await new ProbationSearchApiClient(token).searchProbationer({ nomsNumber: nomisId })
    if (deliusRecords.length < 1) {
      throw new Error(`No delius record found for nomis ID ${nomisId}`)
    }
    return deliusRecords[0]
  }
}
