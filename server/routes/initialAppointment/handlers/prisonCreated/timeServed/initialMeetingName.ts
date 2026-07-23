import { Request, Response } from 'express'
import LicenceService from '../../../../../services/licenceService'
import PathType from '../../../../../enumeration/pathType'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../../enumeration/userType'
import { getTimeServedEditPath } from './index'
import config from '../../../../../config'

export default class InitialMeetingNameRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly path: PathType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const isProbationPractitionerAllocated = !!licence?.responsibleComFullName
    const probationPractitionerOption = {
      RESPONSIBLE_COM: `${licence?.responsibleComFullName}, this person’s community probation practitioner`,
    }
    const appointmentPersonType = {
      DUTY_OFFICER: 'Duty officer',
      ...(isProbationPractitionerAllocated && probationPractitionerOption),
      SPECIFIC_PERSON: 'Someone else',
      ...(config.finalThirdEnabled && { NO_APPOINTMENT_NEEDED: 'No appointment needed' }),
    }

    res.render('pages/initialAppointment/prisonCreated/initialMeetingPerson', {
      appointmentPersonType,
      continueOrSaveLabel: this.path === PathType.EDIT ? 'Save' : 'Continue',
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    await this.licenceService.updateAppointmentPerson(licenceId, req.body, user)
    flashInitialApptUpdatedMessage(req, licence, UserType.PRISON)

    if (PathType.EDIT === this.path) {
      return res.redirect(getTimeServedEditPath(licence))
    }
    return res.redirect(`/licence/time-served/create/id/${licence.id}/initial-meeting-place`)
  }
}
