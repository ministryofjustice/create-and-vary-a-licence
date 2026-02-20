import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import { format } from 'date-fns'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ComCaseloadService from '../../../services/lists/comCaseloadService'
import { parseCvlDate } from '../../../utils/utils'

export default class CaseloadRoutes {
  constructor(private readonly comCaseloadService: ComCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query?.view === 'team'
    const search = req.query?.search as string
    const { user } = res.locals

    const cases = (
      teamView
        ? await this.comCaseloadService.getTeamVaryCaseload(user, req.session.teamSelection)
        : await this.comCaseloadService.getStaffVaryCaseload(user)
    ).map(comCase => {
      const releaseDate = comCase.releaseDate ? format(parseCvlDate(comCase.releaseDate), 'dd MMM yyyy') : 'not found'
      return {
        ...comCase,
        releaseDate,
        licenceStatus: comCase.isReviewNeeded ? LicenceStatus.REVIEW_NEEDED : comCase.licenceStatus,
        kind: comCase.kind,
        isLao: comCase.isLao,
      }
    })

    const reviewCount = await this.comCaseloadService.getComReviewCount(user)
    const { myCount } = reviewCount
    let { teams } = reviewCount

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
      teams = teams.filter(t => t.teamCode === teamCode)
      teamName = user.probationTeams.find((t: { code: string }) => t.code === teamCode)?.label

      req.session.returnToCase = '/licence/vary/caseload?view=team'
    } else {
      req.session.returnToCase = '/licence/vary/caseload'
    }

    const caseloadViewModel = cases
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.crnNumber?.toLowerCase().includes(searchString) ||
          c.name.toLowerCase().includes(searchString) ||
          c.probationPractitioner?.name.toLowerCase().includes(searchString)
        )
      })
      .sort(this.prioritiseReviewNeeded)
    const hasPriorityCases = caseloadViewModel.filter(c => c.isReviewNeeded).length > 0

    res.render('pages/vary/caseload', {
      caseload: caseloadViewModel,
      statusConfig,
      teamView,
      teamName,
      multipleTeams,
      search,
      myCount,
      teamCount: teams.reduce((totalCount, teams) => totalCount + teams.count, 0),
      hasPriorityCases,
    })
  }

  prioritiseReviewNeeded(
    a: { isReviewNeeded: boolean; releaseDate: string },
    b: { isReviewNeeded: boolean; releaseDate: string },
  ) {
    const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
    const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
    if (a.isReviewNeeded && !b.isReviewNeeded) {
      return -1
    }
    if (!a.isReviewNeeded && b.isReviewNeeded) {
      return 1
    }
    return crd1 - crd2
  }
}
