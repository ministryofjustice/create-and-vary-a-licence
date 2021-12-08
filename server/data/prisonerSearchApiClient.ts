import config, { ApiConfig } from '../config'
import type { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import { PrisonerSearchByNomisIds } from '../@types/prisonerSearchApiClientTypes'
import RestClient from './hmppsRestClient'

export default class PrisonerSearchApiClient extends RestClient {
  constructor() {
    super('Prisoner search API', config.apis.prisonerSearchApi as ApiConfig)
  }

  async searchPrisoners(prisonerSearchCriteria: PrisonerSearchCriteria, username: string): Promise<Prisoner[]> {
    return (await this.post(
      {
        path: '/prisoner-search/match-prisoners',
        data: prisonerSearchCriteria,
      },
      username
    )) as Promise<Prisoner[]>
  }

  async searchPrisonersByNomsIds(nomisIdsToSearch: PrisonerSearchByNomisIds, username?: string): Promise<Prisoner[]> {
    return (await this.post(
      {
        path: '/prisoner-search/prisoner-numbers',
        data: nomisIdsToSearch,
      },
      username
    )) as Promise<Prisoner[]>
  }
}
