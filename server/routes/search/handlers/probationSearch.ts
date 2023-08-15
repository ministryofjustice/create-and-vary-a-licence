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

    // sort by in API is working weirdly as not being registered in the wiremock - need to fix
    // once retrieved we will need to loop through the list of results and show the names etc based on the list
    // the counts can be used as well
    // sort by is being a bit of a pain - how to ascertain sort by - eg aria and set it so the backend knows
    // nuances re team name columns and any other questions - eg if query is blank and search clicked - display the message or bring back all on team
    // jest testing
    // cypress testing

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
