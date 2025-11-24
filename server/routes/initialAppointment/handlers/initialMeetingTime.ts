import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import DateTime from '../types/dateTime'
import LicenceType from '../../../enumeration/licenceType'
import UserType from '../../../enumeration/userType'
import AppointmentTimeType from '../../../enumeration/appointmentTimeType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'

export default class InitialMeetingTimeRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly userType: UserType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const formDate = DateTime.toDateTime(licence.appointmentTime)
    const appointmentTimeType: Record<string, string> = AppointmentTimeType

    return res.render('pages/initialAppointment/initialMeetingTime', {
      formDate,
      appointmentTimeType,
      skipUrl: this.getNextPage(licence.id.toString(), licence.typeCode, req),
      canSkip: !licence.appointmentTimeType,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    await this.licenceService.updateAppointmentTime(licenceId, req.body, user)

    flashInitialApptUpdatedMessage(req, licence, this.userType)

    return res.redirect(this.getNextPage(licenceId, licence.typeCode, req))
  }

  getNextPage = (licenceId: string, typeCode: string, request: Request): string => {
    if (this.userType === UserType.PRISON) {
      return `/licence/view/id/${licenceId}/show`
    }
    if (request.query?.fromReview) {
      return `/licence/create/id/${licenceId}/check-your-answers`
    }
    if (typeCode === LicenceType.AP || typeCode === LicenceType.AP_PSS) {
      return `/licence/create/id/${licenceId}/additional-licence-conditions-question`
    }
    return `/licence/create/id/${licenceId}/additional-pss-conditions-question`
  }
}
