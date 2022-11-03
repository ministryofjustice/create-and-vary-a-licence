import { Request, Response } from 'express'
import _ from 'lodash'
import { format, getUnixTime } from 'date-fns'
import CaseloadService from '../../../services/caseloadService'
import PrisonerService from '../../../services/prisonerService'
import { convertToTitleCase, selectReleaseDate } from '../../../utils/utils'

export default class ApprovalCaseRoutes {
  constructor(private readonly caseloadService: CaseloadService, private readonly prisonerService: PrisonerService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string

    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const hasMultipleCaseloadsInNomis = user.prisonCaseload.length > 1
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]
    const cases = await this.caseloadService.getApproverCaseload(user, prisonCaseloadToDisplay)

    const caseloadViewModel = cases
      .map(c => {
        return {
          licenceId: _.head(c.licences).id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          releaseDate: selectReleaseDate(c.nomisRecord),
          releaseDateLabel: c.nomisRecord.confirmedReleaseDate ? 'Confirmed release date' : 'CRD',
        }
      })
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.name.toLowerCase().includes(searchString) ||
          c.prisonerNumber?.toLowerCase().includes(searchString) ||
          c.probationPractitioner?.name.toLowerCase().includes(searchString)
        )
      })
      .sort((a, b) => {
        const crd1 = getUnixTime(new Date(a.releaseDate))
        const crd2 = getUnixTime(new Date(b.releaseDate))
        return crd1 - crd2
      })

    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))

    res.render('pages/approve/cases', {
      cases: caseloadViewModel,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
    })
  }
}
