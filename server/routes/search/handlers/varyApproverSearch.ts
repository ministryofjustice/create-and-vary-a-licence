import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'
import { VaryApproverCaseloadSearchResponse } from '../../../@types/licenceApiClientTypes'

export default class VaryApproverSearch {
  constructor(private readonly searchService: SearchService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const queryTerm = req.query?.queryTerm as string
    const { user } = res.locals

    let results: VaryApproverCaseloadSearchResponse

    if (queryTerm.length === 0) {
      results = {
        pduCasesResponse: [],
        regionCasesResponse: [],
      }
    } else {
      results = await this.searchService.getVaryApproverSearchResults(user, queryTerm)
    }

    const { pduCasesResponse, regionCasesResponse } = results

    const backLink = '/licence/vary-approve/list'

    const activeTab = pduCasesResponse.length >= regionCasesResponse.length ? '#pdu-cases' : '#region-cases'

    const tabParameters = {
      activeTab,
      pduCases: {
        tabId: 'tab-heading-pdu-cases',
        tabHeading: 'Cases in this PDU',
        resultsCount: pduCasesResponse.length,
      },
      regionCases: {
        tabId: 'tab-heading-region-cases',
        tabHeading: 'All cases in this region',
        resultsCount: regionCasesResponse.length,
      },
    }

    return res.render('pages/search/varyApproverSearch/varyApproverSearch', {
      queryTerm,
      backLink,
      tabParameters,
      pduCases: pduCasesResponse,
      regionCases: regionCasesResponse,
    })
  }
}
