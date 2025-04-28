import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import { DeliusManager, DeliusPDUHead, DeliusStaff, DeliusStaffName } from '../@types/deliusClientTypes'
import type { TokenStore } from './tokenStore'
import { components } from '../@types/deliusApiImport'

export default class DeliusClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'Delius Integration', config.apis.delius as ApiConfig)
  }

  async getStaffDetailByUsername(username: string): Promise<DeliusStaff> {
    return (await this.get({ path: `/staff/${username}` })) as Promise<DeliusStaff>
  }

  async getStaffDetailByStaffCode(username: string): Promise<DeliusStaff> {
    return (await this.get({ path: `/staff/bycode/${username}` })) as Promise<DeliusStaff>
  }

  async getStaffDetailsByUsernameList(usernames: string[]): Promise<DeliusStaffName[]> {
    return (await this.post({ path: `/staff`, data: usernames })) as Promise<DeliusStaffName[]>
  }

  async assignDeliusRole(deliusUsername: string): Promise<void> {
    await this.put({ path: `/users/${deliusUsername}/roles` })
  }

  async removeDeliusRole(deliusUsername: string): Promise<void> {
    await this.delete({ path: `/users/${deliusUsername}/roles` })
  }

  async getPduHeads(pduCode: string): Promise<DeliusPDUHead[]> {
    return (await this.get({ path: `/staff/${pduCode}/pdu-head` })) as Promise<DeliusPDUHead[]>
  }

  async getResponsibleCommunityManager(crn: string): Promise<DeliusManager> {
    return (await this.get({ path: `/probation-case/${crn}/responsible-community-manager` })) as Promise<DeliusManager>
  }
}

export function nameToString(name: components['schemas']['Name']): string {
  return name
    ? [name.forename, name.middleName, name.surname]
        .filter(s => s && s.trim() !== '')
        .join(' ')
        .trim()
    : ''
}
