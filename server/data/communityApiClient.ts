import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import {
  CommunityApiStaffDetails,
  CommunityApiOffenderManager,
  CommunityApiManagedOffender,
} from '../@types/communityClientTypes'

export default class CommunityApiClient extends RestClient {
  constructor() {
    super('Community API', config.apis.communityApi as ApiConfig)
  }

  async getStaffDetailByUsername(username: string): Promise<CommunityApiStaffDetails> {
    return (await this.get({
      path: `/secure/staff/username/${username}`,
    })) as Promise<CommunityApiStaffDetails>
  }

  async getStaffDetailByStaffIdentifier(staffIdentifier: number): Promise<CommunityApiStaffDetails> {
    return (await this.get({
      path: `/secure/staff/staffIdentifier/${staffIdentifier}`,
    })) as Promise<CommunityApiStaffDetails>
  }

  async getStaffDetailsByUsernameList(usernames: string[]): Promise<CommunityApiStaffDetails[]> {
    return (await this.post({
      path: `/secure/staff/list`,
      data: usernames,
    })) as Promise<CommunityApiStaffDetails[]>
  }

  async getStaffDetailByStaffCodeList(staffCodes: string[]): Promise<CommunityApiStaffDetails[]> {
    return (await this.post({
      path: `/secure/staff/list/staffCodes`,
      data: staffCodes,
    })) as Promise<CommunityApiStaffDetails[]>
  }

  async getStaffCaseload(staffId: number): Promise<CommunityApiManagedOffender[]> {
    return (await this.get({
      path: `/secure/staff/staffIdentifier/${staffId}/caseload/managedOffenders`,
    })) as Promise<CommunityApiManagedOffender[]>
  }

  async getTeamCaseload(teamCode: string): Promise<CommunityApiManagedOffender[]> {
    return (await this.get({
      path: `/secure/team/${teamCode}/caseload/managedOffenders`,
    })) as Promise<CommunityApiManagedOffender[]>
  }

  async getAnOffendersManagers(crn: string): Promise<CommunityApiOffenderManager[]> {
    return (await this.get({
      path: `/secure/offenders/crn/${crn}/allOffenderManagers`,
    })) as Promise<CommunityApiOffenderManager[]>
  }
}
