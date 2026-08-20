import { Request, Response } from 'express'
import LicenceService from '../../../../../services/licenceService'
import PathType from '../../../../../enumeration/pathType'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../../enumeration/userType'
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
    const { user, licence } = res.locals

    const updateFromNoAppointment =
      licence.appointmentPersonType === 'NO_APPOINTMENT_NEEDED' &&
      req.body.appointmentPersonType !== 'NO_APPOINTMENT_NEEDED'

    await this.licenceService.updateAppointmentPerson(licence.id, req.body, user)
    flashInitialApptUpdatedMessage(req, licence, UserType.PRISON, updateFromNoAppointment)

    if (this.path === PathType.EDIT) {
      res.redirect(`/licence/hard-stop/id/${licence.id}/check-your-answers`)
    } else if (req.body.appointmentPersonType === 'NO_APPOINTMENT_NEEDED') {
      res.redirect(`/licence/hard-stop/create/id/${licence.id}/licence-contact-address`)
    } else {
      res.redirect(`/licence/hard-stop/create/id/${licence.id}/initial-meeting-place`)
    }
  }
}
