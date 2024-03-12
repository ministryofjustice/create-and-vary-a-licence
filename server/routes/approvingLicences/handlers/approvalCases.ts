import { Request, Response } from 'express'
import _ from 'lodash'
import { format, getUnixTime, isAfter, isValid, parse, subDays } from 'date-fns'
import CaseloadService from '../../../services/caseloadService'
import PrisonerService from '../../../services/prisonerService'
import { convertToTitleCase, selectReleaseDate } from '../../../utils/utils'

export default class ApprovalCaseRoutes {
  constructor(
    private readonly caseloadService: CaseloadService,
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
    const cases = await this.caseloadService.getApproverCaseload(user, prisonCaseloadToDisplay, approvalNeededView)

    const caseloadViewModel = cases
      .map(c => {
        const releaseDate = selectReleaseDate(c.nomisRecord)
        const urgentApproval = this.isUrgentApproval(releaseDate)
        let approvedDate
        if (_.head(c.licences).approvedDate) {
          approvedDate = format(
            parse(_.head(c.licences).approvedDate, 'dd/MM/yyyy HH:mm:ss', new Date()),
            'dd MMMM yyyy'
          )
        }
        return {
          licenceId: _.head(c.licences).id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          submittedByFullName: _.head(c.licences).submittedByFullName,
          releaseDate,
          urgentApproval,
          approvedBy: _.head(c.licences).approvedBy,
          approvedOn: approvedDate,
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

  isUrgentApproval = (releaseDateString: string): boolean => {
    const releaseDate = parse(releaseDateString, 'dd MMM yyyy', new Date())
    const isValidDate = isValid(releaseDate)
    return isValidDate && isAfter(new Date(), subDays(releaseDate, 2))
  }
}
