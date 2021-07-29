import type HmppsAuthClient from '../data/hmppsAuthClient'
import CommunityApiClient from '../data/communityApiClient'
import { CommunityApiStaffDetails, CommunityApiManagedOffender } from '../data/communityClientTypes'

export default class CommunityService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  // TODO: Convert the staff details into a service class using class-transformer
  async getStaffDetail(username: string, deliusUsername: string): Promise<CommunityApiStaffDetails> {
    // Important: No username is passed into the getSystemClientToken for the community API
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return new CommunityApiClient(token).getStaffDetailByUsername(deliusUsername)
  }

  // TODO: Convert the list of managed offenders into service class using class-transformer
  async getManagedOffenders(username: string, staffIdentifier: number): Promise<CommunityApiManagedOffender[]> {
    // Important: No username is passed into the getSystemClientToken for the community API
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return new CommunityApiClient(token).getStaffCaseload(staffIdentifier)
  }
}
