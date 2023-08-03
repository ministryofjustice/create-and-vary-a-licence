import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'

export default class ProbationSearch {
  constructor(private readonly searchService: SearchService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/search/search')
  }
}
