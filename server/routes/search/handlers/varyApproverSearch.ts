import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'

export default class VaryApproverSearch {
  constructor(private readonly searchService: SearchService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const queryTerm = req.query?.queryTerm as string
    const backLink = '/licence/vary-approve/list'

    const tabParameters = {
      pduCases: {
        tabId: 'tab-heading-pdu-cases',
      },
      regionCases: {
        tabId: 'tab-heading-region-cases',
      },
    }

    return res.render('pages/search/varyApproverSearch/varyApproverSearch', {
      queryTerm,
      backLink,
      tabParameters,
    })
  }
}
