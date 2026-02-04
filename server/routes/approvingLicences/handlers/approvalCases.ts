import type { Request, Response } from 'express'
import { format } from 'date-fns'
import type PrisonerService from '../../../services/prisonerService'
import type ApproverCaseloadService from '../../../services/lists/approverCaseloadService'
import { cvlDateToDateShort, parseCvlDate, parseCvlDateTime } from '../../../utils/utils'

export default class ApprovalCaseRoutes {
  constructor(
    private readonly approverCaseloadService: ApproverCaseloadService,
    private readonly prisonerService: PrisonerService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query?.search as string
    const approvalNeededView = req.query?.approval !== 'recently'
    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const hasMultipleCaseloadsInNomis = user.prisonCaseload.length > 1
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]
    const searchTerm = search?.toLowerCase().trim()
    const cases = (
      approvalNeededView
        ? await this.approverCaseloadService.getApprovalNeeded(user, prisonCaseloadToDisplay, searchTerm)
        : await this.approverCaseloadService.getRecentlyApproved(user, prisonCaseloadToDisplay, searchTerm)
    ).map(c => {
      return {
        ...c,
        releaseDate: c.releaseDate ? cvlDateToDateShort(c.releaseDate) : 'not found',
        approvedOn: c.approvedOn ? cvlDateToDateShort(c.approvedOn) : null,
      }
    })

    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))

    res.render('pages/approve/cases', {
      cases,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
      approvalNeededView,
    })
  }
}
