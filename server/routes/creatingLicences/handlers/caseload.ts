import { Request, Response } from 'express'
import _ from 'lodash'
import { parse, subDays } from 'date-fns'
import moment from 'moment'
import CaseloadService from '../../../services/caseloadService'
import statusConfig from '../../../licences/licenceStatus'
import logger from '../../../../logger'
import createCaseloadViewModel from '../../views/CaseloadViewModel'

export default class CaseloadRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query.view === 'team'
    const search = req.query.search as string

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
      ? await this.caseloadService.getTeamCreateCaseload(user, req.session.teamSelection)
      : await this.caseloadService.getStaffCreateCaseload(user)

    const hardStopCutoffDate = parse(
      (await this.caseloadService.getCutOffDateForLicenceTimeOut(user)).cutoffDate,
      'dd/MM/yyyy',
      new Date()
    )
    const hardStopWarningDate = subDays(hardStopCutoffDate, 2)

    const hardStopDates = { hardStopCutoffDate, hardStopWarningDate }

    const caseloadViewModel = createCaseloadViewModel(caseload, search, hardStopDates)
    res.render('pages/create/caseload', {
      caseload: caseloadViewModel,
      statusConfig,
      teamView,
      teamName,
      multipleTeams,
      search,
      hardStopCutoffDate: moment(hardStopCutoffDate).format('DD MMM YYYY'),
    })
  }
}
