import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import LicenceService from '../../../services/licenceService'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import logger from '../../../../logger'

export default class CaseloadRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query.view === 'team'
    const search = req.query.search as string

    const { user } = res.locals

    logger.info(`GET caseload for ${user?.username} with roles ${user?.userRoles} team view: ${teamView}`)

    const caseload = teamView
      ? await this.caseloadService.getTeamCreateCaseload(user, req.session.teamSelection)
      : await this.caseloadService.getStaffCreateCaseload(user)

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
<<<<<<< HEAD
      req.session.returnToCase = '/licence/create/caseload?view=team'
    } else {
      req.session.returnToCase = '/licence/create/caseload'
=======
      req.session.returnTo = '/licence/create/caseload?view=team'
    } else {
      req.session.returnTo = '/licence/create/caseload'
>>>>>>> cb43f66 (CVSL-990-Returns user to wrong place after submitting)
    }

    const caseloadViewModel = caseload
      .map(c => ({
        name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
        crnNumber: c.deliusRecord.offenderCrn,
        prisonerNumber: c.nomisRecord.prisonerNumber,
        releaseDate: moment(c.nomisRecord.releaseDate || c.nomisRecord.conditionalReleaseDate).format('DD MMM YYYY'),
        licenceId: _.head(c.licences).id,
        licenceStatus: _.head(c.licences).status,
        licenceType: _.head(c.licences).type,
        probationPractitioner: c.probationPractitioner,
        isClickable:
          c.probationPractitioner !== undefined &&
          _.head(c.licences).status !== LicenceStatus.NOT_IN_PILOT &&
          _.head(c.licences).status !== LicenceStatus.OOS_RECALL &&
          _.head(c.licences).status !== LicenceStatus.OOS_BOTUS,
      }))
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.crnNumber?.toLowerCase().includes(searchString) ||
          c.name.toLowerCase().includes(searchString) ||
          c.probationPractitioner?.name.toLowerCase().includes(searchString)
        )
      })
      .sort((a, b) => {
        const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
        const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
        return crd1 - crd2
      })
    res.render('pages/create/caseload', {
      caseload: caseloadViewModel,
      statusConfig,
      teamView,
      teamName,
      multipleTeams,
      search,
    })
  }
}
