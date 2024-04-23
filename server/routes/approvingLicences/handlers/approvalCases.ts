import { Request, Response } from 'express'
import _ from 'lodash'
import { format, getUnixTime, isAfter, isValid, subDays } from 'date-fns'
import PrisonerService from '../../../services/prisonerService'
import { convertToTitleCase, parseCvlDateTime, selectReleaseDate } from '../../../utils/utils'
import ApproverCaseloadService from '../../../services/approverCaseloadService'

export default class ApprovalCaseRoutes {
  constructor(
    private readonly approverCaseloadService: ApproverCaseloadService,
    private readonly prisonerService: PrisonerService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string
    const approvalNeededView = req.query.approval !== 'recently'
    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const hasMultipleCaseloadsInNomis = user.prisonCaseload.length > 1
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]
    const cases = approvalNeededView
      ? await this.approverCaseloadService.getApprovalNeeded(user, prisonCaseloadToDisplay)
      : await this.approverCaseloadService.getRecentlyApproved(user, prisonCaseloadToDisplay)

    const caseloadViewModel = cases
      .map(c => {
        const releaseDate = selectReleaseDate(c.nomisRecord)
        const urgentApproval = this.isUrgentApproval(releaseDate)
        const licence = _.head(c.licences)
        let approvedDate
        if (licence.approvedDate) {
          approvedDate = format(parseCvlDateTime(licence.approvedDate, { withSeconds: true }), 'dd MMMM yyyy')
        }
        return {
          licenceId: licence.id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          submittedByFullName: licence.submittedByFullName,
          releaseDate: releaseDate ? format(releaseDate, 'dd MMM yyyy') : 'not found',
          urgentApproval,
          approvedBy: licence.approvedBy,
          approvedOn: approvedDate,
          isDueForEarlyRelease: licence.isDueForEarlyRelease,
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
      approvalNeededView,
    })
  }

  isUrgentApproval = (releaseDate: Date): boolean => {
    const isValidDate = isValid(releaseDate)
    return isValidDate && isAfter(new Date(), subDays(releaseDate, 2))
  }
}
