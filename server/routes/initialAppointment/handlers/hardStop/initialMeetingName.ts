import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import PathType from '../../../../enumeration/pathType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../enumeration/userType'

export default class InitialMeetingNameRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly path: PathType
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const isProbationPractionerAllocated = !!licence?.responsibleComFullName
    const probationPractionerOption = {
      RESPONSIBLE_COM: `${licence?.responsibleComFullName}, this person’s probation practitioner`,
    }
    const appointmentPersonType = {
      DUTY_OFFICER: 'Duty Officer',
      ...(isProbationPractionerAllocated && probationPractionerOption),
      SPECIFIC_PERSON: 'Someone else',
    }

    res.render('pages/create/hardStop/initialMeetingPerson', {
      appointmentPersonType,
      continueOrSaveLabel: this.path === PathType.EDIT ? 'Save' : 'Continue',
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    await this.licenceService.updateAppointmentPerson(licenceId, req.body, user)
    flashInitialApptUpdatedMessage(req, licence, UserType.PRISON)

    if (this.path === PathType.EDIT) {
      res.redirect(`/licence/hard-stop/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/hard-stop/create/id/${licenceId}/initial-meeting-place`)
    }
  }
}
