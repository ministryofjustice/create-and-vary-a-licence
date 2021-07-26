import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import type { StaffDetail, ManagedOffender } from './communityClientTypes'

export default class CommunityApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Community API', config.apis.communityApi as ApiConfig, token)
  }

  async getStaffDetailByUsername(username: string): Promise<StaffDetail> {
    return this.restClient.get({ path: `/secure/staff/username/${username}` }) as Promise<StaffDetail>
  }

  async getStaffCaseload(staffId: number): Promise<ManagedOffender[]> {
    return this.restClient.get({
      path: `/secure/staff/staffIdentifier/${staffId}/managedOffenders`,
    }) as Promise<ManagedOffender[]>
  }
}
