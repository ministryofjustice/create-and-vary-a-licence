import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import CaseloadService from '../../../services/caseloadService'
import statusConfig from '../../../licences/licenceStatus'
import { convertToTitleCase } from '../../../utils/utils'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class CaseloadRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query.view === 'team'
    const search = req.query.search as string
    const { user } = res.locals

    const cases = teamView
      ? await this.caseloadService.getTeamVaryCaseload(user, req.session.teamSelection)
      : await this.caseloadService.getStaffVaryCaseload(user)

    const reviewCount = await this.caseloadService.getComReviewCount(user)
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
      .map(c => {
        const licence =
          c.licences.length > 1 ? c.licences.find(l => l.status !== LicenceStatus.ACTIVE) : _.head(c.licences)

        return {
          licenceId: licence.id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          crnNumber: c.deliusRecord.otherIds.crn,
          licenceType: licence.type,
          releaseDate: moment(c.nomisRecord.releaseDate, 'YYYY-MM-DD').format('DD MMM YYYY'),
          licenceStatus: licence.status,
          probationPractitioner: c.probationPractitioner,
        }
      })
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

    res.render('pages/vary/caseload', {
      caseload: caseloadViewModel,
      statusConfig,
      teamView,
      teamName,
      multipleTeams,
      search,
      myCount,
      teamCount: teams.reduce((totalCount, teams) => totalCount + teams.count, 0),
    })
  }

  prioritiseReviewNeeded(
    a: { licenceStatus: LicenceStatus; releaseDate: string },
    b: { licenceStatus: LicenceStatus; releaseDate: string }
  ) {
    const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
    const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
    if (a.licenceStatus === LicenceStatus.REVIEW_NEEDED && b.licenceStatus !== LicenceStatus.REVIEW_NEEDED) {
      return -1
    }
    if (a.licenceStatus !== LicenceStatus.REVIEW_NEEDED && b.licenceStatus === LicenceStatus.REVIEW_NEEDED) {
      return 1
    }
    return crd1 - crd2
  }
}
