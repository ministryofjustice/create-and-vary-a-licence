import { Request, Response } from 'express'
import { format } from 'date-fns'
import statusConfig from '../../../licences/licenceStatus'
import ComCaseloadService from '../../../services/lists/comCaseloadService'
import { parseCvlDate } from '../../../utils/utils'

export default class ProbationTeamRoutes {
  constructor(private readonly comCaseloadService: ComCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const view = req.query.view as string
    const { teamCode } = req.params

    if (!view) {
      return res.redirect(`/support/probation-teams/${teamCode}/caseload?view=prison`)
    }

    const { user } = res.locals

    const caseload = (
      view === 'prison'
        ? await this.comCaseloadService.getTeamCreateCaseload(user, [teamCode])
        : await this.comCaseloadService.getTeamVaryCaseload(user, [teamCode])
    ).map(comCase => {
      const releaseDate = comCase.releaseDate ? format(parseCvlDate(comCase.releaseDate), 'dd MMM yyyy') : 'not found'
      return {
        ...comCase,
        releaseDate,
        hardStopDate: comCase.hardStopDate && format(parseCvlDate(comCase.hardStopDate), 'dd/MM/yyyy'),
        hardStopWarningDate:
          comCase.hardStopWarningDate && format(parseCvlDate(comCase.hardStopWarningDate), 'dd/MM/yyyy'),
      }
    })

    return res.render('pages/support/probationTeam', {
      caseload,
      statusConfig,
      teamCode,
      view,
    })
  }
}
