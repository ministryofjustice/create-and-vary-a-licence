import PrisonRegisterApiClient from '../data/prisonRegisterApiClient'
import { PrisonDto } from '../@types/prisonRegisterTypes'

export default class PrisonRegisterService {
  constructor(private readonly prisonRegisterApiClient: PrisonRegisterApiClient) {}

  async getPrisonDescription(username: string, agencyId: string): Promise<PrisonDto> {
    return this.prisonRegisterApiClient.getPrisonDescription(agencyId, username)
  }

  async getPrisonOmuContactEmail(username: string, agencyId: string): Promise<string> {
    return this.prisonRegisterApiClient.getPrisonOmuContactEmail(agencyId, username)
  }
}
