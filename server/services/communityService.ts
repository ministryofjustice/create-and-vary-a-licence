import _ from 'lodash'
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

  async getStaffDetailByStaffCode(staffCode: string): Promise<CommunityApiStaffDetails> {
    return this.communityApiClient.getStaffDetailByStaffCode(staffCode)
  }

  async getStaffDetailByStaffCodeList(staffCodes: string[]): Promise<CommunityApiStaffDetails[]> {
    const staffDetails = []
    /* eslint-disable */
    for (const codes of _.chunk(staffCodes, 500)) {
      const partResult = await this.communityApiClient.getStaffDetailByStaffCodeList(codes)
      staffDetails.push(partResult)
    }
    /* eslint-enable */

    return staffDetails.flat()
  }

  async getStaffDetailByStaffIdentifier(staffIdentifier: number): Promise<CommunityApiStaffDetails> {
    return this.communityApiClient.getStaffDetailByStaffIdentifier(staffIdentifier)
  }

  async getStaffDetailsByUsernameList(usernames: string[]): Promise<CommunityApiStaffDetails[]> {
    if (usernames.length === 0) {
      return []
    }
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

  async getPduHeads(pduCode: string): Promise<CommunityApiStaffDetails[]> {
    return this.communityApiClient.getPduHeads(pduCode)
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
    const offenderDetails = []
    if (nomsNumbers.length > 0) {
      /* eslint-disable */
      for (const nomsNums of _.chunk(nomsNumbers, 500)) {
        const partResult = await this.probationSearchApiClient.getOffendersByNomsNumbers(nomsNums)
        offenderDetails.push(partResult)
      }
      /* eslint-enable */
      return offenderDetails.flat()
    }
    return []
  }

  // Has slower lookup than probation offender search /crns, but also has no lag-time after Community API event raised
  // Only to be used when probation offender search api is return outdated information.
  async getSingleOffenderByCrn(crn: string): Promise<OffenderDetail> {
    return this.communityApiClient.getOffenderDetails(crn)
  }
}
