import type HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonRegisterApiClient from '../data/prisonRegisterApiClient'
import { PrisonDto } from '../@types/prisonRegisterTypes'

export default class PrisonRegisterService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getPrisonDescription(username: string, agencyId: string): Promise<PrisonDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new PrisonRegisterApiClient(token).getPrisonDescription(agencyId)
  }

  async getPrisonOmuContactEmail(username: string, agencyId: string): Promise<string> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new PrisonRegisterApiClient(token).getPrisonOmuContactEmail(agencyId)
  }
}
