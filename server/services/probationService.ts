import _ from 'lodash'
import DeliusClient from '../data/deliusClient'
import { DeliusManager, DeliusPDUHead, DeliusRecord, DeliusStaff } from '../@types/deliusClientTypes'

export default class ProbationService {
  constructor(private readonly deliusClient: DeliusClient) {}

  async getStaffDetailByUsername(username: string): Promise<DeliusStaff> {
    return this.deliusClient.getStaffDetailByUsername(username)
  }

  async getStaffDetailByStaffCode(staffCode: string): Promise<DeliusStaff> {
    return this.deliusClient.getStaffDetailByStaffCode(staffCode)
  }

  async getPduHeads(pduCode: string): Promise<DeliusPDUHead[]> {
    return this.deliusClient.getPduHeads(pduCode)
  }

  async getProbationer(crnOrNomisId: string): Promise<DeliusRecord> {
    const probationer = await this.deliusClient.getCase(crnOrNomisId)
    if (!probationer) throw new Error(`No delius record found`)
    return probationer
  }

  async getProbationers(crnsOrNomisIds: string[]): Promise<DeliusRecord[]> {
    return (await Promise.all(_.chunk(crnsOrNomisIds, 500).map(chunk => this.deliusClient.getCases(chunk)))).flat()
  }

  async getResponsibleCommunityManager(crnOrNomisId: string): Promise<DeliusManager> {
    return this.deliusClient.getResponsibleCommunityManager(crnOrNomisId)
  }

  async getResponsibleCommunityManagers(crnsOrNomisIds: string[]): Promise<DeliusManager[]> {
    return this.deliusClient.getResponsibleCommunityManagers(crnsOrNomisIds)
  }
}
