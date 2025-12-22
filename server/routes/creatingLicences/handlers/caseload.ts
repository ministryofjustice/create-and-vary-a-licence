import { Request, Response } from 'express'
import _ from 'lodash'
import { format } from 'date-fns'
import statusConfig from '../../../licences/licenceStatus'
import logger from '../../../../logger'
import ComCaseloadService from '../../../services/lists/comCaseloadService'
import { parseCvlDate } from '../../../utils/utils'
import LicenceCreationType from '../../../enumeration/licenceCreationType'
import { LicenceKind } from '../../../enumeration'

export default class CaseloadRoutes {
  constructor(private readonly comCaseloadService: ComCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query?.view === 'team'
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

    const comCaseload = (
      teamView
        ? await this.comCaseloadService.getTeamCreateCaseload(user, req.session.teamSelection)
        : await this.comCaseloadService.getStaffCreateCaseload(user)
    ).map(comCase => {
      return {
        ...comCase,
        createLink: this.findCreateLinkToDisplay(
          comCase.licenceCreationType,
          comCase.licenceId,
          comCase.prisonerNumber,
        ),
        releaseDate: comCase.releaseDate && format(parseCvlDate(comCase.releaseDate), 'dd MMM yyyy'),
        hardStopDate: comCase.hardStopDate && format(parseCvlDate(comCase.hardStopDate), 'dd/MM/yyyy'),
        hardStopWarningDate:
          comCase.hardStopWarningDate && format(parseCvlDate(comCase.hardStopWarningDate), 'dd/MM/yyyy'),
        isClickable:
          comCase.probationPractitioner?.allocated ||
          comCase.kind === LicenceKind.TIME_SERVED ||
          comCase.kind === LicenceKind.HARD_STOP,
        sortDate: comCase.releaseDate && parseCvlDate(comCase.releaseDate),
        kind: comCase.kind,
      }
    })

    res.render('pages/create/caseload', {
      caseload: comCaseload,
      statusConfig,
      teamView,
      teamName,
      multipleTeams,
    })
  }

  findCreateLinkToDisplay = (licenceCreationType: string, licenceId: number, prisonerNumber: string): string => {
    if (licenceCreationType === LicenceCreationType.LICENCE_CHANGES_NOT_APPROVED_IN_TIME) {
      return `/licence/create/id/${licenceId}/licence-changes-not-approved-in-time`
    }

    if (licenceCreationType === LicenceCreationType.PRISON_WILL_CREATE_THIS_LICENCE) {
      return `/licence/create/nomisId/${prisonerNumber}/prison-will-create-this-licence`
    }

    if (licenceCreationType === LicenceCreationType.LICENCE_CREATED_BY_PRISON) {
      return `/licence/create/id/${licenceId}/licence-created-by-prison`
    }

    if (licenceCreationType === LicenceCreationType.LICENCE_NOT_STARTED) {
      return `/licence/create/nomisId/${prisonerNumber}/confirm`
    }

    return `/licence/create/id/${licenceId}/check-your-answers`
  }
}
