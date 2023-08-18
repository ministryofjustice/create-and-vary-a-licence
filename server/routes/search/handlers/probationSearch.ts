import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'

export default class ProbationSearch {
  constructor(private readonly searchService: SearchService) {}

  POST = async (req: Request, res: Response): Promise<void> => {
    const { queryTerm } = req.body
    const { deliusStaffIdentifier } = res.locals.user

    const searchResponse = await this.searchService.getProbationSearchResults(queryTerm, deliusStaffIdentifier)
    req.session.returnToCase = '/search/probation-search'
    res.render('pages/search/probationSearch/probationSearch', {
      queryTerm,
      deliusStaffIdentifier,
      searchResponse,
      statusConfig,
    })
  }
}
