import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import type { OffenderDetail, SearchDto } from '../@types/probationSearchApiClientTypes'

export default class ProbationSearchApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Probation search API', config.apis.probationSearchApi as ApiConfig, token)
  }

  async searchProbationer(searchCriteria: SearchDto): Promise<OffenderDetail[]> {
    return this.restClient.post({
      path: '/search',
      data: searchCriteria,
    }) as Promise<OffenderDetail[]>
  }
}
