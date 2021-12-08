import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import type { PrisonDto } from '../@types/prisonRegisterTypes'

export default class PrisonRegisterApiClient extends RestClient {
  constructor() {
    super('Prison register API', config.apis.prisonRegisterApi as ApiConfig)
  }

  async getPrisonDescription(agencyId: string, username: string): Promise<PrisonDto> {
    return (await this.get(
      {
        path: `/prisons/id/${agencyId}`,
      },
      username
    )) as Promise<PrisonDto>
  }

  async getPrisonOmuContactEmail(agencyId: string, username: string): Promise<string> {
    return (await this.get(
      {
        path: `/secure/prisons/id/${agencyId}/offender-management-unit/email-address`,
        responseType: 'text',
      },
      username
    )) as Promise<string>
  }
}
