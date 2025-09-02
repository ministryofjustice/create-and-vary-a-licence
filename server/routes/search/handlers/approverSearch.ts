import { Request, Response } from 'express'
import { format } from 'date-fns'
import PrisonerService from '../../../services/prisonerService'
import SearchService from '../../../services/searchService'
import { ApproverSearchResponse } from '../../../@types/licenceApiClientTypes'
import { parseCvlDate, parseCvlDateTime } from '../../../utils/utils'

export default class ApproverSearch {
  constructor(
    private readonly searchService: SearchService,
    private readonly prisonerService: PrisonerService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const queryTerm = req.query?.queryTerm as string
    const { prisonCaseloadToDisplay, hasSelectedMultiplePrisonCaseloads } = res.locals.user

    const changeLocationHref =
      queryTerm.length > 0
        ? `/licence/approve/change-location?queryTerm=${queryTerm}`
        : '/licence/approve/change-location'

    let results: ApproverSearchResponse

    if (queryTerm.length === 0) {
      results = {
        approvalNeededResponse: [],
        recentlyApprovedResponse: [],
      }
    } else {
      results = await this.searchService.getPrisonApproverSearchResults(queryTerm, prisonCaseloadToDisplay)
    }

    const { approvalNeededResponse, recentlyApprovedResponse } = results

    const approvalNeededCases = approvalNeededResponse.map(c => {
      return {
        ...c,
        releaseDate: c.releaseDate ? format(parseCvlDate(c.releaseDate), 'dd MMM yyyy') : 'not found',
      }
    })
    const recentlyApprovedCases = recentlyApprovedResponse.map(c => {
      return {
        ...c,
        releaseDate: c.releaseDate ? format(parseCvlDate(c.releaseDate), 'dd MMM yyyy') : 'not found',
        approvedOn: c.approvedOn ? format(parseCvlDateTime(c.approvedOn, { withSeconds: true }), 'dd MMM yyyy') : null,
      }
    })
    const backLink = '/licence/approve/cases'

    const activeTab =
      approvalNeededResponse.length >= recentlyApprovedResponse.length ? '#approval-needed' : '#recently-approved'

    const tabParameters = {
      activeTab,
      approvalNeeded: {
        tabId: 'tab-heading-approval-needed',
        tabHeading: 'Approval needed',
        resultsCount: approvalNeededResponse.length,
      },
      recentlyApproved: {
        tabId: 'tab-heading-recently-approved',
        tabHeading: 'Recently approved',
        resultsCount: recentlyApprovedResponse.length,
      },
    }

    const allPrisons = await this.prisonerService.getPrisons()
    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))

    return res.render('pages/search/approverSearch/approverSearch', {
      queryTerm,
      backLink,
      tabParameters,
      hasMultipleCaseloadsInNomis,
      hasSelectedMultiplePrisonCaseloads,
      prisonsToDisplay,
      approvalNeededCases,
      recentlyApprovedCases,
      changeLocationHref,
    })
  }
}
