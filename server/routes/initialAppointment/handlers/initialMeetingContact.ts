import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import UserType from '../../../enumeration/userType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'

export default class InitialMeetingContactRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly userType: UserType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { edit } = req.query
    const { licence } = res.locals
    const noAppointmentNeeded = licence.appointmentPersonType === 'NO_APPOINTMENT_NEEDED'
    return res.render('pages/initialAppointment/initialMeetingContact', {
      edit,
      noAppointmentNeeded,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    await this.licenceService.updateContactNumber(licenceId, req.body, user)

    flashInitialApptUpdatedMessage(req, licence, this.userType)

    if (this.userType === UserType.PRISON) {
      res.redirect(`/licence/view/id/${licenceId}/show`)
    } else if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else if (licence.appointmentPersonType === 'NO_APPOINTMENT_NEEDED') {
      res.redirect(`/licence/create/id/${licenceId}/additional-licence-conditions-question`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/initial-meeting-time`)
    }
  }
}
