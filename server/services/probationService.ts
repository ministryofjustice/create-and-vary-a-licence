import _ from 'lodash'
import DeliusClient from '../data/deliusClient'
import ProbationSearchApiClient from '../data/probationSearchApiClient'
import { OffenderDetail, SearchDto } from '../@types/probationSearchApiClientTypes'
import { DeliusManager, DeliusPDUHead, DeliusStaff, DeliusStaffName } from '../@types/deliusClientTypes'

export default class ProbationService {
  constructor(
    private readonly deliusClient: DeliusClient,
    private readonly probationSearchApiClient: ProbationSearchApiClient,
  ) {}

  async getStaffDetailByUsername(username: string): Promise<DeliusStaff> {
    return this.deliusClient.getStaffDetailByUsername(username)
  }

  async getStaffDetailByStaffCode(staffCode: string): Promise<DeliusStaff> {
    return this.deliusClient.getStaffDetailByStaffCode(staffCode)
  }

  async getStaffDetailsByUsernameList(usernames: string[]): Promise<DeliusStaffName[]> {
    if (usernames.length === 0) {
      return []
    }
    return this.deliusClient.getStaffDetailsByUsernameList(usernames)
  }

  async assignDeliusRole(deliusUsername: string): Promise<void> {
    return this.deliusClient.assignDeliusRole(deliusUsername)
  }

  async getPduHeads(pduCode: string): Promise<DeliusPDUHead[]> {
    return this.deliusClient.getPduHeads(pduCode)
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
  async getResponsibleCommunityManager(crn: string): Promise<DeliusManager> {
    return this.deliusClient.getResponsibleCommunityManager(crn)
  }
}
