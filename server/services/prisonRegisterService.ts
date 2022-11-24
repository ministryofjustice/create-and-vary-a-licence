import PrisonRegisterApiClient from '../data/prisonRegisterApiClient'
import { PrisonDto } from '../@types/prisonRegisterTypes'
import { User } from '../@types/CvlUserDetails'

export default class PrisonRegisterService {
  constructor(private readonly prisonRegisterApiClient: PrisonRegisterApiClient) {}

  async getPrisonDescription(agencyId: string, user: User): Promise<PrisonDto> {
    return this.prisonRegisterApiClient.getPrisonDescription(agencyId, user)
  }
}
