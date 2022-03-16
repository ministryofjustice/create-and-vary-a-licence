import CommunityApiClient from '../data/communityApiClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import { OffenderDetail, SearchDto } from '../@types/probationSearchApiClientTypes'
import {
  CommunityApiManagedOffender,
  CommunityApiOffenderManager,
  CommunityApiStaffDetails,
  CommunityApiUserDetails,
} from '../@types/communityClientTypes'

export default class CommunityService {
  constructor(
    private readonly communityApiClient: CommunityApiClient,
    private readonly probationSearchApiClient: ProbationSearchApiClient
  ) {}

  async getStaffDetailByUsername(username: string): Promise<CommunityApiStaffDetails> {
    return this.communityApiClient.getStaffDetailByUsername(username)
  }

  async getStaffDetailByStaffCodeList(staffCodes: string[]): Promise<CommunityApiStaffDetails[]> {
    return this.communityApiClient.getStaffDetailByStaffCodeList(staffCodes)
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

  async getUserDetailsByUsername(deliusUsername: string): Promise<CommunityApiUserDetails> {
    return this.communityApiClient.getUserDetailsByUsername(deliusUsername)
  }

  async assignDeliusRole(deliusUsername: string, deliusRoleId: string): Promise<void> {
    return this.communityApiClient.assignDeliusRole(deliusUsername, deliusRoleId)
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

  async getOffendersByNomsNumbers(nomsNumbers: string[]): Promise<OffenderDetail[]> {
    return this.probationSearchApiClient.getOffendersByNomsNumbers(nomsNumbers)
  }
}
