import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'

export default class ProbationSearch {
  constructor(private readonly searchService: SearchService) {}

  POST = async (req: Request, res: Response): Promise<void> => {
    const { queryTerm } = req.body
    const { deliusStaffIdentifier } = res.locals.user

    // need to call off to the search service to get back the results from the api
    // the results back from the api may need to be put in a special model
    // this means we can access the various parts of the object being sent back from the api
    // once retrieved we will need to loop through the list of results and show the names etc based on the list
    // the counts can be used as well

    const inPrisonCount = 1
    const onProbationCount = 0

    res.render('pages/search/probationSearch', {
      queryTerm,
      deliusStaffIdentifier,
      inPrisonCount,
      onProbationCount,
    })
  }
}
