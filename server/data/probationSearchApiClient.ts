import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import type { OffenderDetail, SearchDto } from '../@types/probationSearchApiClientTypes'

export default class ProbationSearchApiClient extends RestClient {
  constructor() {
    super('Probation search API', config.apis.probationSearchApi as ApiConfig)
  }

  async searchProbationer(searchCriteria: SearchDto): Promise<OffenderDetail[]> {
    return (await this.post({
      path: '/search',
      data: searchCriteria,
    })) as Promise<OffenderDetail[]>
  }
}
