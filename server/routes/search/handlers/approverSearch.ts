import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'

export default class ApproverSearch {
  constructor(private readonly searchService: SearchService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const queryTerm = req.query?.queryTerm as string
    const backLink = '/licence/approve/cases'

    const tabParameters = {
      approvalNeeded: {
        tabId: 'tab-heading-approval-needed',
      },
      recentlyApproved: {
        tabId: 'tab-heading-recently-approved',
      },
    }

    return res.render('pages/search/approverSearch/approverSearch', {
      queryTerm,
      backLink,
      tabParameters,
    })
  }
}
