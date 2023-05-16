import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import {
  CommunityApiStaffDetails,
  CommunityApiOffenderManager,
  CommunityApiManagedOffender,
  CommunityApiUserDetails,
} from '../@types/communityClientTypes'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import type { TokenStore } from './tokenStore'

export default class CommunityApiClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'Community API', config.apis.communityApi as ApiConfig)
  }

  async getStaffDetailByUsername(username: string): Promise<CommunityApiStaffDetails> {
    return (await this.get({
      path: `/secure/staff/username/${username}`,
    })) as Promise<CommunityApiStaffDetails>
  }

  async getStaffDetailByStaffCode(staffCode: string): Promise<CommunityApiStaffDetails> {
    return (await this.get({
      path: `/secure/staff/staffCode/${staffCode}`,
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

  async getUserDetailsByUsername(deliusUsername: string): Promise<CommunityApiUserDetails> {
    return (await this.get({
      path: `/secure/users/${deliusUsername}/details`,
    })) as Promise<CommunityApiUserDetails>
  }

  async assignDeliusRole(deliusUsername: string, deliusRoleId: string): Promise<void> {
    await this.put({
      path: `/secure/users/${deliusUsername}/roles/${deliusRoleId}`,
    })
  }

  async getPduHeads(pduCode: string): Promise<CommunityApiStaffDetails[]> {
    return (await this.get({ path: `/secure/staff/pduHeads/${pduCode}` })) as Promise<CommunityApiStaffDetails[]>
  }

  async getOffenderDetails(crn: string): Promise<OffenderDetail> {
    return (await this.get({ path: `/secure/offenders/crn/${crn}/all` })) as Promise<OffenderDetail>
  }
}
