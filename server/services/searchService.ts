import { ParsedProbationSearchResult } from '../@types/parsedProbationSearchResult'
import LicenceApiClient from '../data/licenceApiClient'
import { parseCvlDate } from '../utils/utils'

export default class SearchService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getProbationSearchResults(
    queryTerm: string,
    deliusStaffIdentifier: number
  ): Promise<ParsedProbationSearchResult> {
    const response = await this.licenceApiClient.searchForOffenderOnStaffCaseload({
      query: queryTerm,
      staffIdentifier: deliusStaffIdentifier,
      sortBy: [],
    })

    const results = response.results.map(c => {
      const hardStopDate = parseCvlDate(c.hardStopDate)
      const hardStopWarningDate = parseCvlDate(c.hardStopWarningDate)
      return { ...c, hardStopDate, hardStopWarningDate }
    })

    return { ...response, results }
  }
}
