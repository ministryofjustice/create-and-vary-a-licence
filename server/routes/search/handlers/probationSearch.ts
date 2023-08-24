import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'

export default class ProbationSearch {
  constructor(private readonly searchService: SearchService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const queryTerm = req.query.queryTerm as string
    const { deliusStaffIdentifier } = res.locals.user
    const previousPage = req.query.previousPage as string

    const searchResponse = await this.searchService.getProbationSearchResults(queryTerm, deliusStaffIdentifier)
    const searchResults = searchResponse.results
    const backLink = this.getBackLink(previousPage)

    let inPrisonCountText: string
    let onProbationCountText: string

    if (searchResponse.inPrisonCount === 0 || searchResponse.inPrisonCount > 1) {
      inPrisonCountText = `People in prison (${searchResponse.inPrisonCount} results)`
    } else {
      inPrisonCountText = `People in prison (${searchResponse.inPrisonCount} result)`
    }

    if (searchResponse.onProbationCount === 0 || searchResponse.onProbationCount > 1) {
      onProbationCountText = `People on probation (${searchResponse.onProbationCount} results)`
    } else {
      onProbationCountText = `People on probation (${searchResponse.onProbationCount} result)`
    }

    return res.render('pages/search/probationSearch/probationSearch', {
      queryTerm,
      deliusStaffIdentifier,
      searchResults,
      inPrisonCountText,
      onProbationCountText,
      statusConfig,
      backLink,
    })
  }

  private getBackLink = (previousPage: string) => {
    return previousPage === 'create' ? '/licence/create/caseload' : '/licence/vary/caseload'
  }
}
