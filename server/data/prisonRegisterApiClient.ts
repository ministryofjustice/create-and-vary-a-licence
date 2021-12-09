import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import type { PrisonDto } from '../@types/prisonRegisterTypes'
import { User } from '../@types/CvlUserDetails'

export default class PrisonRegisterApiClient extends RestClient {
  constructor() {
    super('Prison register API', config.apis.prisonRegisterApi as ApiConfig)
  }

  async getPrisonDescription(agencyId: string, user: User): Promise<PrisonDto> {
    return (await this.get(
      {
        path: `/prisons/id/${agencyId}`,
      },
      { username: user.username }
    )) as Promise<PrisonDto>
  }

  async getPrisonOmuContactEmail(agencyId: string, user: User): Promise<string> {
    return (await this.get(
      {
        path: `/secure/prisons/id/${agencyId}/offender-management-unit/email-address`,
        responseType: 'text',
      },
      { username: user.username }
    )) as Promise<string>
  }
}
