import { ProbationSearchResult } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class SearchService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getProbationSearchResults(queryTerm: string, deliusStaffIdentifier: number): Promise<ProbationSearchResult> {
    return this.licenceApiClient.searchForOffenderOnStaffCaseload({
      query: queryTerm,
      staffIdentifier: deliusStaffIdentifier,
      sortBy: [],
    })
  }
}
