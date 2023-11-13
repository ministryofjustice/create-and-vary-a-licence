import { Request, Response } from 'express'
import CaseloadService from '../../../services/caseloadService'
import createCaseloadViewModel from '../../views/CaseloadViewModel'
import statusConfig from '../../../licences/licenceStatus'
import CommunityService from '../../../services/communityService'

export default class ProbationTeamRoutes {
  constructor(
    private readonly caseloadService: CaseloadService,
    private communityService: CommunityService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const view = req.query.view as string
    const id = parseInt(req.query.id as string, 10)

    if (!view) {
      return res.redirect(`/support/probation/staff?id=${id}&view=prison`)
    }

    const { user } = res.locals

    const staff = await this.communityService.getStaffDetailByStaffIdentifier(id)

    const caseload =
      view === 'prison'
        ? await this.caseloadService.getStaffCreateCaseload({ ...user, deliusStaffIdentifier: id })
        : await this.caseloadService.getStaffVaryCaseload({ ...user, deliusStaffIdentifier: id })

    return res.render('pages/support/probationStaff', {
      caseload: createCaseloadViewModel(caseload, undefined),
      statusConfig,
      id,
      view,
      staffName: `${staff.staff.forenames} ${staff.staff.surname} (${staff.staffCode})`,
    })
  }
}
