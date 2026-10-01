import { Request, Response } from 'express'
import _ from 'lodash'
import { format } from 'date-fns'
import statusConfig from '../../../licences/licenceStatus'
import logger from '../../../../logger'
import ComCaseloadService from '../../../services/lists/comCaseloadService'
import { cvlDateToDateShort, parseCvlDate } from '../../../utils/utils'
import LicenceCreationType from '../../../enumeration/licenceCreationType'
import { LicenceKind } from '../../../enumeration'
import type { ComCreateCase } from '../../../@types/licenceApiClientTypes'
import config from '../../../config'

export default class CaseloadRoutes {
  constructor(private readonly comCaseloadService: ComCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const view = req.query?.view === 'team' ? 'team' : 'me'
    const teamView = view === 'team'

    const { user } = res.locals

    logger.info(`GET caseload for ${user?.username} with roles ${user?.userRoles} team view: ${teamView}`)

    let teamName = null
    let multipleTeams = false

    if (teamView) {
      const selectedTeam = req.session.teamSelection
      multipleTeams = user.probationTeamCodes.length > 1

      // user must select a team if more than one is available
      if (multipleTeams && !selectedTeam) {
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

    const comCaseload =
      view === 'team'
        ? await this.comCaseloadService.getTeamCreateCaseload(user, req.session.teamSelection)
        : await this.comCaseloadService.getStaffCreateCaseload(user)

    const viewModelCaseload = comCaseload.map(comCase => {
      return {
        ...comCase,
        createLink: this.findCreateLinkToDisplay(comCase),
        releaseDate: comCase.releaseDate && cvlDateToDateShort(comCase.releaseDate),
        hardStopDate: comCase.hardStopDate && format(parseCvlDate(comCase.hardStopDate), 'dd/MM/yyyy'),
        hardStopWarningDate:
          comCase.hardStopWarningDate && format(parseCvlDate(comCase.hardStopWarningDate), 'dd/MM/yyyy'),
        isClickable:
          comCase.probationPractitioner?.allocated ||
          comCase.kind === LicenceKind.TIME_SERVED ||
          comCase.kind === LicenceKind.HARD_STOP,
        sortDate: !comCase.isRestricted && comCase.releaseDate ? parseCvlDate(comCase.releaseDate) : null,
        kind: comCase.kind,
        isRestricted: comCase.isRestricted,
      }
    })

    res.render('pages/create/caseload', {
      caseload: viewModelCaseload,
      statusConfig,
      teamName,
      multipleTeams,
      view,
    })
  }

  findCreateLinkToDisplay = (comCase: ComCreateCase): string => {
    if (comCase.licenceCreationType === LicenceCreationType.LICENCE_CHANGES_NOT_APPROVED_IN_TIME) {
      return `/licence/create/id/${comCase.licenceId}/licence-changes-not-approved-in-time`
    }

    if (comCase.licenceCreationType === LicenceCreationType.PRISON_WILL_CREATE_THIS_LICENCE) {
      return `/licence/create/nomisId/${comCase.prisonerNumber}/prison-will-create-this-licence`
    }

    if (comCase.licenceCreationType === LicenceCreationType.LICENCE_CREATED_BY_PRISON) {
      return `/licence/create/id/${comCase.licenceId}/licence-created-by-prison`
    }

    if (comCase.licenceCreationType === LicenceCreationType.LICENCE_NOT_STARTED) {
      return `/licence/create/nomisId/${comCase.prisonerNumber}/confirm`
    }

    if (this.isHdcOptOut(comCase)) {
      return `/licence/create/id/${comCase.licenceId}/opt-out-interrupt`
    }
    return `/licence/create/id/${comCase.licenceId}/check-your-answers`
  }

  isHdcOptOut = (comCase: ComCreateCase): boolean => {
    logger.info(`Hdc optOut toggle: ${config.hdc.hdcOptOutToggle}, licence status: ${comCase.licenceStatus}`)
    return config.hdc.hdcOptOutToggle && comCase.licenceStatus === 'IN_PROGRESS' // && comCase.isHdcOptOut == true*
  }
}
