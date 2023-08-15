import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'

export default class ProbationSearch {
  constructor(private readonly searchService: SearchService) {}

  POST = async (req: Request, res: Response): Promise<void> => {
    const { queryTerm } = req.body
    const { deliusStaffIdentifier } = res.locals.user

    const searchResponse = this.searchService.getProbationSearchResults(queryTerm, deliusStaffIdentifier)

    const { inPrisonCount } = await searchResponse
    const { onProbationCount } = await searchResponse
    const searchResults = (await searchResponse).results

    res.render('pages/search/probationSearch', {
      queryTerm,
      deliusStaffIdentifier,
      inPrisonCount,
      onProbationCount,
      searchResults,
      statusConfig,
    })
  }
}
