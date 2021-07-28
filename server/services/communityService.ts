import type HmppsAuthClient from '../data/hmppsAuthClient'
import CommunityApiClient from '../data/communityApiClient'
import { CommunityApiStaffDetails, CommunityApiManagedOffender } from '../data/communityClientTypes'

export default class CommunityService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  // TODO: Convert the staff details into a display object type when required.
  async getStaffDetail(username: string): Promise<CommunityApiStaffDetails> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new CommunityApiClient(token).getStaffDetailByUsername(username)
  }

  // TODO: Convert the list of managed offenders into a display object type when required.
  async getManagedOffenders(username: string, staffIdentifier: number): Promise<CommunityApiManagedOffender[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new CommunityApiClient(token).getStaffCaseload(staffIdentifier)
  }
}
