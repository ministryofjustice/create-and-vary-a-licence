import { Request, Response } from 'express'
import CaseloadService from '../../../services/lists/caseloadService'
import createCaseloadViewModel from '../../views/CaseloadViewModel'
import statusConfig from '../../../licences/licenceStatus'

export default class ProbationTeamRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const view = req.query.view as string
    const { teamCode } = req.params

    if (!view) {
      return res.redirect(`/support/probation-teams/${teamCode}/caseload?view=prison`)
    }

    const { user } = res.locals

    const caseload =
      view === 'prison'
        ? await this.caseloadService.getTeamCreateCaseload(user, [teamCode])
        : await this.caseloadService.getTeamVaryCaseload(user, [teamCode])

    return res.render('pages/support/probationTeam', {
      caseload: createCaseloadViewModel(caseload, undefined),
      statusConfig,
      teamCode,
      view,
    })
  }
}
