import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import {
  CommunityApiStaffDetails,
  CommunityApiManagedOffender,
  CommunityApiTeamManagedCase,
  CommunityApiOffenderManager,
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

  async getStaffCaseload(staffId: number): Promise<CommunityApiManagedOffender[]> {
    return (await this.get({
      path: `/secure/staff/staffIdentifier/${staffId}/managedOffenders`,
      query: { current: true },
    })) as Promise<CommunityApiManagedOffender[]>
  }

  async getTeamCaseload(teamCodes: string[]): Promise<CommunityApiTeamManagedCase[]> {
    return (await this.get({
      path: `/secure/teams/managedOffenders`,
      query: { teamCode: teamCodes, current: true },
    })) as Promise<CommunityApiTeamManagedCase[]>
  }

  async getAnOffendersManagers(crn: string): Promise<CommunityApiOffenderManager[]> {
    return (await this.get({
      path: `/secure/offenders/crn/${crn}/allOffenderManagers`,
    })) as Promise<CommunityApiOffenderManager[]>
  }
}
