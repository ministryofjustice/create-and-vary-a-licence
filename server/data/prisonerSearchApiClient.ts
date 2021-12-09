import config, { ApiConfig } from '../config'
import type { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import { PrisonerSearchByNomisIds } from '../@types/prisonerSearchApiClientTypes'
import RestClient from './hmppsRestClient'
import { User } from '../@types/CvlUserDetails'

export default class PrisonerSearchApiClient extends RestClient {
  constructor() {
    super('Prisoner search API', config.apis.prisonerSearchApi as ApiConfig)
  }

  async searchPrisoners(prisonerSearchCriteria: PrisonerSearchCriteria, user: User): Promise<Prisoner[]> {
    return (await this.post(
      {
        path: '/prisoner-search/match-prisoners',
        data: prisonerSearchCriteria,
      },
      { username: user.username }
    )) as Promise<Prisoner[]>
  }

  async searchPrisonersByNomsIds(nomisIdsToSearch: PrisonerSearchByNomisIds, user?: User): Promise<Prisoner[]> {
    return (await this.post(
      {
        path: '/prisoner-search/prisoner-numbers',
        data: nomisIdsToSearch,
      },
      { username: user?.username }
    )) as Promise<Prisoner[]>
  }
}
