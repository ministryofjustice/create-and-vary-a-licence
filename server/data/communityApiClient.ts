import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import { CommunityApiStaffDetails, CommunityApiManagedOffender } from './communityClientTypes'

export default class CommunityApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Community API', config.apis.communityApi as ApiConfig, token)
  }

  async getStaffDetailByUsername(username: string): Promise<CommunityApiStaffDetails> {
    return this.restClient.get({ path: `/secure/staff/username/${username}` }) as Promise<CommunityApiStaffDetails>
  }

  async getStaffCaseload(staffId: number): Promise<CommunityApiManagedOffender[]> {
    return this.restClient.get({
      path: `/secure/staff/staffIdentifier/${staffId}/managedOffenders`,
    }) as Promise<CommunityApiManagedOffender[]>
  }
}
