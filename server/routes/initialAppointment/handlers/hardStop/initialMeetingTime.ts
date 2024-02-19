import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import DateTime from '../../types/dateTime'
import LicenceType from '../../../../enumeration/licenceType'
import UserType from '../../../../enumeration/userType'
import AppointmentTimeType from '../../../../enumeration/appointmentTimeType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'

export default class InitialMeetingTimeRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly userType: UserType
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const formDate = DateTime.toDateTime(licence.appointmentTime)
    const appointmentTimeType: Record<string, string> = AppointmentTimeType

    return res.render('pages/create/hardStop/initialMeetingTime', {
      formDate,
      appointmentTimeType,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    await this.licenceService.updateAppointmentTime(licenceId, req.body, user)

    flashInitialApptUpdatedMessage(req, licence, this.userType)

    return res.redirect(`/licence/view/id/${licenceId}/show`)
  }
}
