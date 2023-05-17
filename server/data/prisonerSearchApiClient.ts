import config, { ApiConfig } from '../config'
import type { PagePrisoner, Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import { PrisonerSearchByBookingIds, PrisonerSearchByNomisIds } from '../@types/prisonerSearchApiClientTypes'
import RestClient from './hmppsRestClient'
import type { TokenStore } from './tokenStore'

import { User } from '../@types/CvlUserDetails'

export default class PrisonerSearchApiClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'Prisoner search API', config.apis.prisonerSearchApi as ApiConfig)
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

  async searchPrisonersByBookingIds(bookingIdsToSearch: PrisonerSearchByBookingIds, user?: User): Promise<Prisoner[]> {
    return (await this.post(
      {
        path: '/prisoner-search/booking-ids',
        data: bookingIdsToSearch,
      },
      { username: user?.username }
    )) as Promise<Prisoner[]>
  }

  async searchPrisonersByReleaseDate(
    earliestReleaseDate: string,
    latestReleaseDate: string,
    prisonIds?: string[],
    user?: User
  ): Promise<PagePrisoner> {
    return (await this.post(
      {
        path: `/prisoner-search/release-date-by-prison`,
        data: {
          earliestReleaseDate,
          latestReleaseDate,
          prisonIds,
        },
        query: { size: 2000 },
      },
      { username: user?.username }
    )) as Promise<PagePrisoner>
  }
}
