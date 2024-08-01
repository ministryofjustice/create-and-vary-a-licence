import { Request, Response } from 'express'
import _ from 'lodash'
import statusConfig from '../../../licences/licenceStatus'
import logger from '../../../../logger'
import createCaseloadViewModel from '../../views/CaseloadViewModel'
import ComCaseloadService from '../../../services/lists/comCaseloadService'

export default class CaseloadRoutes {
  constructor(private readonly comCaseloadService: ComCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query.view === 'team'
    const { user } = res.locals

    logger.info(`GET caseload for ${user?.username} with roles ${user?.userRoles} team view: ${teamView}`)

    let teamName = null
    let multipleTeams = false

    if (teamView) {
      const selectedTeam = req.session.teamSelection
      multipleTeams = user.probationTeamCodes.length > 1

      // user must select a team if more than one is available
      if (user.probationTeamCodes.length > 1 && !selectedTeam) {
        res.redirect('caseload/change-team')
        return
      }

      // selectedTeam and probationTeamCodes are both arrays
      const teamCode = _.head(selectedTeam || user.probationTeamCodes)
      teamName = user.probationTeams.find((t: { code: string }) => t.code === teamCode)?.label
      req.session.returnToCase = '/licence/create/caseload?view=team'
    } else {
      req.session.returnToCase = '/licence/create/caseload'
    }

    const caseload = teamView
      ? await this.comCaseloadService.getTeamCreateCaseload(user, req.session.teamSelection)
      : await this.comCaseloadService.getStaffCreateCaseload(user)

    const caseloadViewModel = createCaseloadViewModel(caseload)
    res.render('pages/create/caseload', {
      caseload: caseloadViewModel,
      statusConfig,
      teamView,
      teamName,
      multipleTeams,
    })
  }
}
