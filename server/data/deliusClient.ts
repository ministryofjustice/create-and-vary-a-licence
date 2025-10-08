import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import { DeliusManager, DeliusPDUHead, DeliusRecord, DeliusStaff } from '../@types/deliusClientTypes'
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

  async assignDeliusRole(deliusUsername: string): Promise<void> {
    await this.put({ path: `/users/${deliusUsername}/roles` })
  }

  async getPduHeads(pduCode: string): Promise<DeliusPDUHead[]> {
    return (await this.get({ path: `/staff/${pduCode}/pdu-head` })) as Promise<DeliusPDUHead[]>
  }

  async getCases(crnOrNomisIds: string[]): Promise<DeliusRecord[]> {
    return (await this.post({ path: '/probation-case', data: crnOrNomisIds })) as Promise<DeliusRecord[]>
  }

  async getCase(crnOrNomisId: string): Promise<DeliusRecord> {
    return (await this.get({ path: `/probation-case/${crnOrNomisId}`, return404: true })) as Promise<DeliusRecord>
  }

  async getResponsibleCommunityManager(crnOrNomisId: string): Promise<DeliusManager> {
    return (await this.get({
      path: `/probation-case/${crnOrNomisId}/responsible-community-manager`,
    })) as Promise<DeliusManager>
  }

  async getResponsibleCommunityManagers(crnOrNomisIds: string[]): Promise<DeliusManager[]> {
    return (await this.post({
      path: `/probation-case/responsible-community-manager`,
      data: crnOrNomisIds,
    })) as Promise<DeliusManager[]>
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
