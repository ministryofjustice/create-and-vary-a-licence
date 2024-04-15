import config, { ApiConfig } from '../config'
import type { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import { PrisonerSearchByBookingIds } from '../@types/prisonerSearchApiClientTypes'
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

  async searchPrisonersByBookingIds(bookingIdsToSearch: PrisonerSearchByBookingIds, user?: User): Promise<Prisoner[]> {
    const { bookingIds } = bookingIdsToSearch
    if (bookingIds.length < 1) {
      return []
    }
    return (await this.post(
      {
        path: '/prisoner-search/booking-ids',
        data: bookingIdsToSearch,
      },
      { username: user?.username }
    )) as Promise<Prisoner[]>
  }
}
