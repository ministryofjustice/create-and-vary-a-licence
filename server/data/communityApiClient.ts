import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import { CommunityApiStaffDetails, CommunityApiManagedOffender } from '../@types/communityClientTypes'

export default class CommunityApiClient extends RestClient {
  constructor() {
    super('Community API', config.apis.communityApi as ApiConfig)
  }

  async getStaffDetailByUsername(username: string): Promise<CommunityApiStaffDetails> {
    return (await this.get({
      path: `/secure/staff/username/${username}`,
    })) as Promise<CommunityApiStaffDetails>
  }

  async getStaffCaseload(staffId: number): Promise<CommunityApiManagedOffender[]> {
    return (await this.get({
      path: `/secure/staff/staffIdentifier/${staffId}/managedOffenders`,
    })) as Promise<CommunityApiManagedOffender[]>
  }
}
