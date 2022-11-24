import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import type { PrisonDto } from '../@types/prisonRegisterTypes'
import { User } from '../@types/CvlUserDetails'

export default class PrisonRegisterApiClient extends RestClient {
  constructor() {
    super('Prison register API', config.apis.prisonRegisterApi as ApiConfig)
  }

  async getPrisonDescription(agencyId: string, user: User): Promise<PrisonDto> {
    try {
      return (await this.get(
        {
          path: `/prisons/id/${agencyId}`,
        },
        { username: user.username }
      )) as Promise<PrisonDto>
    } catch (error) {
      return error.status >= 400 && error.status < 500 ? null : error
    }
  }
}
