import { Request, Response } from 'express'
import createCaseloadViewModel from '../../views/CaseloadViewModel'
import statusConfig from '../../../licences/licenceStatus'
import CommunityService from '../../../services/communityService'
import ComCaseloadService from '../../../services/lists/comCaseloadService'

export default class ProbationTeamRoutes {
  constructor(
    private readonly comCaseloadService: ComCaseloadService,
    private readonly communityService: CommunityService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const view = req.query.view as string
    const { staffCode } = req.params

    if (!view) {
      return res.redirect(`/support/probation-practitioner/${staffCode}/caseload?view=prison`)
    }

    const { user } = res.locals

    const staff = await this.communityService.getStaffDetailByStaffCode(staffCode)

    const caseload =
      view === 'prison'
        ? await this.comCaseloadService.getStaffCreateCaseload({
            ...user,
            deliusStaffIdentifier: staff.staffIdentifier,
          })
        : await this.comCaseloadService.getStaffVaryCaseload({ ...user, deliusStaffIdentifier: staff.staffIdentifier })

    return res.render('pages/support/probationStaff', {
      caseload: createCaseloadViewModel(caseload),
      statusConfig,
      view,
      staffName: `${staff.staff.forenames} ${staff.staff.surname} (${staff.staffCode})`,
    })
  }
}
