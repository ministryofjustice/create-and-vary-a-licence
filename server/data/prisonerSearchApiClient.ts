import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import type { Prisoner, PrisonerSearchCriteria } from './prisonerSearchApiClientTypes'

export default class PrisonerSearchApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prisoner search API', config.apis.prisonerSearchApi as ApiConfig, token)
  }

  async searchPrisoners(prisonerSearchCriteria: PrisonerSearchCriteria): Promise<Prisoner[]> {
    return this.restClient.post({
      path: '/prisoner-search/match-prisoners',
      data: prisonerSearchCriteria,
    }) as Promise<Prisoner[]>
  }
}
