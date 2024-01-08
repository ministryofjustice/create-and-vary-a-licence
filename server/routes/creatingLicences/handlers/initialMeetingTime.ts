import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import DateTime from '../types/dateTime'
import LicenceType from '../../../enumeration/licenceType'
import AppointmentTimeType from '../../../enumeration/appointmentTimeType'

export default class InitialMeetingTimeRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const formDate = DateTime.toDateTime(licence.appointmentTime)
    const appointmentTimeType: Record<string, string> = AppointmentTimeType

    res.render('pages/create/initialMeetingTime', {
      formDate,
      appointmentTimeType,
      releaseIsOnBankHolidayOrWeekend: licence.isEligibleForEarlyRelease,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals
    const { user } = res.locals
    console.log('req.body;', req.body)
    await this.licenceService.updateAppointmentTime(licenceId, req.body, user)

    return res.redirect(this.getNextPage(licenceId, licence.typeCode, req))
  }

  getNextPage = (licenceId: string, typeCode: string, request: Request): string => {
    if (request.query?.fromReview) {
      return `/licence/create/id/${licenceId}/check-your-answers`
    }
    if (typeCode === LicenceType.AP || typeCode === LicenceType.AP_PSS) {
      return `/licence/create/id/${licenceId}/additional-licence-conditions-question`
    }
    return `/licence/create/id/${licenceId}/additional-pss-conditions-question`
  }
}
