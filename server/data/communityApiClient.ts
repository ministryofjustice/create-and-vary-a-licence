import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import { CommunityApiStaffDetails, CommunityApiManagedOffender } from './communityClientTypes'
import logger from '../../logger'

export default class CommunityApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Community API', config.apis.communityApi as ApiConfig, token)
  }

  async getStaffDetailByUsername(deliusUsername: string): Promise<CommunityApiStaffDetails> {
    logger.info(`communityClient: getStaffDetailByUsername(${deliusUsername}`)
    return this.restClient.get({
      path: `/secure/staff/username/${deliusUsername}`,
    }) as Promise<CommunityApiStaffDetails>
  }

  async getStaffCaseload(staffId: number): Promise<CommunityApiManagedOffender[]> {
    logger.info(`communityClient: getStaffCaseload(${staffId}`)
    return this.restClient.get({
      path: `/secure/staff/staffIdentifier/${staffId}/managedOffenders`,
    }) as Promise<CommunityApiManagedOffender[]>
  }
}
