import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'

export default class CaSearch {
  constructor(private readonly searchService: SearchService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const queryTerm = req.query?.queryTerm as string
    const backLink = '/licence/view/cases'

    return res.render('pages/search/caSearch/caSearch', {
      queryTerm,
      backLink,
    })
  }
}
