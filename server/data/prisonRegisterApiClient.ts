import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import type { PrisonDto } from '../@types/prisonRegisterTypes'

export default class PrisonRegisterApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison register API', config.apis.prisonRegisterApi as ApiConfig, token)
  }

  async getPrisonDescription(agencyId: string): Promise<PrisonDto> {
    return this.restClient.get({
      path: `/prisons/id/${agencyId}`,
    }) as Promise<PrisonDto>
  }

  async getPrisonOmuContactEmail(agencyId: string): Promise<string> {
    return this.restClient.get({
      path: `/secure/prisons/id/${agencyId}/offender-management-unit/email-address`,
      responseType: 'text',
    }) as Promise<string>
  }
}
