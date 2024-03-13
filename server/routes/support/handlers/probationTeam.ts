import { Request, Response } from 'express'
import { parse, subDays } from 'date-fns'
import CaseloadService from '../../../services/caseloadService'
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

    const hardStopCutoffDate = parse(
      (await this.caseloadService.getCutOffDateForLicenceTimeOut(user)).cutoffDate,
      'dd/MM/yyyy',
      new Date()
    )
    const hardStopWarningDate = subDays(hardStopCutoffDate, 2)

    const hardStopDates = { hardStopCutoffDate, hardStopWarningDate }

    return res.render('pages/support/probationTeam', {
      caseload: createCaseloadViewModel(caseload, undefined, hardStopDates),
      statusConfig,
      teamCode,
      view,
    })
  }
}
