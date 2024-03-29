import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import type { OffenderDetail, SearchDto } from '../@types/probationSearchApiClientTypes'
import type { TokenStore } from './tokenStore'

export default class ProbationSearchApiClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'Probation search API', config.apis.probationSearchApi as ApiConfig)
  }

  async searchProbationer(searchCriteria: SearchDto): Promise<OffenderDetail[]> {
    return (await this.post({ path: '/search', data: searchCriteria })) as Promise<OffenderDetail[]>
  }

  async getOffendersByCrn(crns: string[]): Promise<OffenderDetail[]> {
    return (await this.post({ path: '/crns', data: crns })) as Promise<OffenderDetail[]>
  }

  async getOffendersByNomsNumbers(nomsNumbers: string[]): Promise<OffenderDetail[]> {
    return (await this.post({ path: '/nomsNumbers', data: nomsNumbers })) as Promise<OffenderDetail[]>
  }
}
