import type HmppsAuthClient from '../data/hmppsAuthClient'
import CommunityApiClient from '../data/communityApiClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import { SearchDto, OffenderDetail } from '../data/probationSearchApiClientTypes'
import { CommunityApiStaffDetails, CommunityApiManagedOffender } from '../data/communityClientTypes'

export default class CommunityService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getStaffDetail(username: string, deliusUsername: string): Promise<CommunityApiStaffDetails> {
    // Important: No username is passed into the getSystemClientToken for the community API
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return new CommunityApiClient(token).getStaffDetailByUsername(deliusUsername)
  }

  async getManagedOffenders(username: string, staffIdentifier: number): Promise<CommunityApiManagedOffender[]> {
    // Important: No username is passed into the getSystemClientToken for the community API
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return new CommunityApiClient(token).getStaffCaseload(staffIdentifier)
  }

  async searchProbationers(username: string, searchCriteria: SearchDto): Promise<OffenderDetail[]> {
    // Important: Check whether the username is required for probation-offender-search-api??
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new ProbationSearchApiClient(token).searchProbationer(searchCriteria)
  }
}
