import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import DateTime from '../../types/dateTime'
import UserType from '../../../../enumeration/userType'
import AppointmentTimeType from '../../../../enumeration/appointmentTimeType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'
import PathType from '../../../../enumeration/pathType'

export default class InitialMeetingTimeRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly path: PathType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const formDate = DateTime.toDateTime(licence.appointmentTime)
    const appointmentTimeType: Record<string, string> = AppointmentTimeType

    return res.render('pages/initialAppointment/prisonCreated/initialMeetingTime', {
      formDate,
      appointmentTimeType,
      continueOrSaveLabel: this.path === PathType.EDIT ? 'Save' : 'Continue',
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    await this.licenceService.updateAppointmentTime(licenceId, req.body, user)

    flashInitialApptUpdatedMessage(req, licence, UserType.PRISON)

    return res.redirect(`/licence/hard-stop/id/${licenceId}/check-your-answers`)
  }
}
