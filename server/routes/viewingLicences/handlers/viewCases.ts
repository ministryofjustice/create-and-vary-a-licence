import { Request, Response } from 'express'
import statusConfig from '../../../licences/licenceStatus'
import { CaViewCasesTab } from '../../../utils/utils'
import PrisonerService from '../../../services/prisonerService'
import CaCaseloadService from '../../../services/lists/caCaseloadService'

export default class ViewAndPrintCaseRoutes {
  constructor(
    private readonly caseloadService: CaCaseloadService,
    private readonly prisonerService: PrisonerService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string
    const view = req.query.view || 'prison'
    const probationView = view === 'probation'
    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const hasMultipleCaseloadsInNomis = user.prisonCaseload.length > 1
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]
    const searchString = search?.toLowerCase().trim()
    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))
    const { cases, showAttentionNeededTab } =
      view === 'prison'
        ? await this.caseloadService.getPrisonView(user, prisonCaseloadToDisplay, searchString)
        : await this.caseloadService.getProbationView(user, prisonCaseloadToDisplay, searchString)

    res.render('pages/view/cases', {
      cases,
      CaViewCasesTab,
      showAttentionNeededTab,
      statusConfig,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
      probationView,
    })
  }
}
