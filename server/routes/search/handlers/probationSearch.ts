import { Request, Response } from 'express'
import moment from 'moment/moment'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'
import { FoundProbationRecord, ProbationSearchResult } from '../../../@types/licenceApiClientTypes'

export default class ProbationSearch {
  constructor(private readonly searchService: SearchService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const enteredQueryTerm = req.query?.queryTerm as string
    const queryTerm = enteredQueryTerm?.trim() || ''
    const { deliusStaffIdentifier } = res.locals.user
    const previousCaseloadPage = req.query?.previousPage as string

    let searchResponse: ProbationSearchResult

    let peopleInPrison: FoundProbationRecord[] = []
    let peopleOnProbation: FoundProbationRecord[] = []
    if (queryTerm.length === 0) {
      searchResponse = {
        results: [],
        inPrisonCount: 0,
        onProbationCount: 0,
      }
    } else {
      searchResponse = await this.searchService.getProbationSearchResults(queryTerm, deliusStaffIdentifier)
      peopleInPrison = searchResponse.results.filter(r => r.isOnProbation === false).sort(this.sortReleaseDateAscending)
      peopleOnProbation = searchResponse.results
        .filter(r => r.isOnProbation === true)
        .sort(this.sortReleaseDateDescending)
    }

    const backLink = this.getBackLink(previousCaseloadPage)

    const activeTab =
      searchResponse.inPrisonCount >= searchResponse.onProbationCount ? '#people-in-prison' : '#people-on-probation'

    const tabParameters = {
      activeTab,
      prisonTabCaption: 'In Prison Search Results',
      probationTabCaption: 'On Probation Search Results',
      prisonTabId: 'tab-heading-prison',
      probationTabId: 'tab-heading-probation',
    }

    const hasPriorityCases = peopleOnProbation.filter(c => c.isReviewNeeded).length > 0
    return res.render('pages/search/probationSearch/probationSearch', {
      queryTerm,
      deliusStaffIdentifier,
      peopleInPrison,
      peopleOnProbation,
      statusConfig,
      backLink,
      previousCaseloadPage,
      tabParameters,
      hasPriorityCases,
    })
  }

  private getBackLink = (previousPage: string) => {
    return previousPage === 'create' ? '/licence/create/caseload' : '/licence/vary/caseload'
  }

  private sortReleaseDateDescending(a: FoundProbationRecord, b: FoundProbationRecord) {
    return sortByReviewNeededDateAndName(a, b, true)
  }

  private sortReleaseDateAscending(a: FoundProbationRecord, b: FoundProbationRecord) {
    return sortByReviewNeededDateAndName(a, b, false)
  }
}

function sortByReviewNeededDateAndName(a: FoundProbationRecord, b: FoundProbationRecord, descending: boolean) {
  const releaseDate1 = moment(a.releaseDate, 'DD/MM/YYYY').unix()
  const releaseDate2 = moment(b.releaseDate, 'DD/MM/YYYY').unix()

  if (a.isReviewNeeded && !b.isReviewNeeded) {
    return -1
  }
  if (!a.isReviewNeeded && b.isReviewNeeded) {
    return 1
  }

  if (releaseDate1 === releaseDate2) {
    const foreName1 = a.name.split(' ')[0]
    const foreName2 = b.name.split(' ')[0]
    return foreName1.localeCompare(foreName2)
  }

  if (descending) {
    return releaseDate2 - releaseDate1
  }
  return releaseDate1 - releaseDate2
}
