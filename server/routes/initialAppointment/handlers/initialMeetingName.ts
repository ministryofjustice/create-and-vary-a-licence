import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import UserType from '../../../enumeration/userType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'
import config from '../../../config'

export default class InitialMeetingNameRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly userType: UserType,
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

    res.render('pages/initialAppointment/initialMeetingPerson', {
      appointmentPersonType,
      userType: this.userType,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const noAppointmentNeeded = licence.appointmentPersonType === 'NO_APPOINTMENT_NEEDED'
    await this.licenceService.updateAppointmentPerson(licenceId, req.body, user)
    flashInitialApptUpdatedMessage(req, licence, this.userType)

    if (this.userType === UserType.PRISON) {
      res.redirect(`/licence/view/id/${licenceId}/show`)
    } else if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else if (noAppointmentNeeded) {
      res.redirect(`/licence/create/id/${licenceId}/licence-contact-address`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/initial-meeting-place`)
    }
  }
}
