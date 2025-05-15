import { Request, Response } from 'express'
import { format } from 'date-fns'
import statusConfig from '../../../licences/licenceStatus'
import ProbationService from '../../../services/probationService'
import ComCaseloadService from '../../../services/lists/comCaseloadService'
import { parseCvlDate } from '../../../utils/utils'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { nameToString } from '../../../data/deliusClient'

export default class ProbationTeamRoutes {
  constructor(
    private readonly comCaseloadService: ComCaseloadService,
    private readonly probationService: ProbationService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const view = req.query?.view as string
    const { staffCode } = req.params

    if (!view) {
      return res.redirect(`/support/probation-practitioner/${staffCode}/caseload?view=prison`)
    }

    const { user } = res.locals

    const staff = await this.probationService.getStaffDetailByStaffCode(staffCode)

    const caseload = (
      view === 'prison'
        ? await this.comCaseloadService.getStaffCreateCaseload({
            ...user,
            deliusStaffIdentifier: staff.id,
          })
        : await this.comCaseloadService.getStaffVaryCaseload({
            ...user,
            deliusStaffIdentifier: staff.id,
          })
    )
      .map(comCase => {
        const releaseDate = comCase.releaseDate ? format(parseCvlDate(comCase.releaseDate), 'dd MMM yyyy') : 'not found'
        return {
          ...comCase,
          releaseDate,
          licenceStatus: comCase.isReviewNeeded ? LicenceStatus.REVIEW_NEEDED : comCase.licenceStatus,
          sortDate: comCase.releaseDate && parseCvlDate(comCase.releaseDate),
        }
      })
      .sort((a, b) => {
        return (a.sortDate?.getTime() || 0) - (b.sortDate?.getTime() || 0)
      })

    return res.render('pages/support/probationStaff', {
      caseload,
      statusConfig,
      view,
      staffName: `${nameToString(staff.name)} (${staff.code})`,
    })
  }
}
