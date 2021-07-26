import type HmppsAuthClient from '../data/hmppsAuthClient'
import CommunityApiClient from '../data/communityApiClient'
import { StaffDetail, ManagedOffender } from '../data/communityClientTypes'

export default class CommunityService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getStaffDetail(username: string): Promise<StaffDetail> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new CommunityApiClient(token).getStaffDetailByUsername(username)
  }

  async getManagedOffenders(username: string, staffIdentifier: number): Promise<ManagedOffender[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new CommunityApiClient(token).getStaffCaseload(staffIdentifier)
  }
}
