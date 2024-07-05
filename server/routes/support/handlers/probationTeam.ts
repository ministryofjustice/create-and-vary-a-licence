import { Request, Response } from 'express'
import createCaseloadViewModel from '../../views/CaseloadViewModel'
import statusConfig from '../../../licences/licenceStatus'
import ComCaseloadService from '../../../services/lists/comCaseloadService'

export default class ProbationTeamRoutes {
  constructor(private readonly comCaseloadService: ComCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const view = req.query.view as string
    const { teamCode } = req.params

    if (!view) {
      return res.redirect(`/support/probation-teams/${teamCode}/caseload?view=prison`)
    }

    const { user } = res.locals

    const caseload =
      view === 'prison'
        ? await this.comCaseloadService.getTeamCreateCaseload(user, [teamCode])
        : await this.comCaseloadService.getTeamVaryCaseload(user, [teamCode])

    return res.render('pages/support/probationTeam', {
      caseload: createCaseloadViewModel(caseload),
      statusConfig,
      teamCode,
      view,
    })
  }
}
