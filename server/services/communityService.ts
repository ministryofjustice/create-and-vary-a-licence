import CommunityApiClient from '../data/communityApiClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import { OffenderDetail, SearchDto } from '../@types/probationSearchApiClientTypes'
import {
  CommunityApiManagedOffender,
  CommunityApiOffenderManager,
  CommunityApiStaffDetails,
} from '../@types/communityClientTypes'

export default class CommunityService {
  constructor(
    private readonly communityApiClient: CommunityApiClient,
    private readonly probationSearchApiClient: ProbationSearchApiClient
  ) {}

  async getStaffDetailByUsername(username: string): Promise<CommunityApiStaffDetails> {
    return this.communityApiClient.getStaffDetailByUsername(username)
  }

  async getStaffDetailByStaffIdentifier(staffIdentifier: number): Promise<CommunityApiStaffDetails> {
    return this.communityApiClient.getStaffDetailByStaffIdentifier(staffIdentifier)
  }

  async getStaffDetailsByUsernameList(usernames: string[]): Promise<CommunityApiStaffDetails[]> {
    return this.communityApiClient.getStaffDetailsByUsernameList(usernames)
  }

  async getManagedOffenders(staffIdentifier: number): Promise<CommunityApiManagedOffender[]> {
    return this.communityApiClient.getStaffCaseload(staffIdentifier)
  }

  async getManagedOffendersByTeam(teamCode: string): Promise<CommunityApiManagedOffender[]> {
    return this.communityApiClient.getTeamCaseload(teamCode)
  }

  async getAnOffendersManagers(crn: string): Promise<CommunityApiOffenderManager[]> {
    return this.communityApiClient.getAnOffendersManagers(crn)
  }

  async searchProbationers(searchCriteria: SearchDto): Promise<OffenderDetail[]> {
    return this.probationSearchApiClient.searchProbationer(searchCriteria)
  }

  async getProbationer(searchDto: SearchDto): Promise<OffenderDetail> {
    const deliusRecords = await this.probationSearchApiClient.searchProbationer(searchDto)
    if (deliusRecords.length < 1) {
      throw new Error(`No delius record found`)
    }
    return deliusRecords[0]
  }

  async getOffendersByCrn(crns: string[]): Promise<OffenderDetail[]> {
    return this.probationSearchApiClient.getOffendersByCrn(crns)
  }
}
