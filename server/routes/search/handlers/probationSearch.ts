import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'
import type { ProbationSearchResult } from '../../../@types/licenceApiClientTypes'

export default class ProbationSearch {
  constructor(private readonly searchService: SearchService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const queryTerm = req.query.queryTerm as string
    const { deliusStaffIdentifier } = res.locals.user
    const previousCaseloadPage = req.query.previousPage as string

    let searchResponse: ProbationSearchResult

    if (queryTerm.length === 0) {
      searchResponse = {
        results: [],
        inPrisonCount: 0,
        onProbationCount: 0,
      }
    } else {
      searchResponse = await this.searchService.getProbationSearchResults(queryTerm, deliusStaffIdentifier)
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

    return res.render('pages/search/probationSearch/probationSearch', {
      queryTerm,
      deliusStaffIdentifier,
      searchResponse,
      statusConfig,
      backLink,
      previousCaseloadPage,
      tabParameters,
    })
  }

  private getBackLink = (previousPage: string) => {
    return previousPage === 'create' ? '/licence/create/caseload' : '/licence/vary/caseload'
  }
}
