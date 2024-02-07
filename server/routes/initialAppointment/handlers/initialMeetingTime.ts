import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import DateTime from '../types/dateTime'
import LicenceType from '../../../enumeration/licenceType'
import UserType from '../../../enumeration/userType'
import AppointmentTimeType from '../../../enumeration/appointmentTimeType'
import config from '../../../config'
import LicenceKind from '../../../enumeration/LicenceKind'

export default class InitialMeetingTimeRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly userType: UserType
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const formDate = DateTime.toDateTime(licence.appointmentTime)
    const appointmentTimeType: Record<string, string> = AppointmentTimeType

    return res.render('pages/create/initialMeetingTime', {
      formDate,
      appointmentTimeType,
      releaseIsOnBankHolidayOrWeekend: licence.isEligibleForEarlyRelease,
      skipUrl: this.getNextPage(licence.id.toString(), licence.typeCode, req),
      canSkip:
        this.userType === UserType.PROBATION &&
        !licence.appointmentTimeType &&
        licence.kind !== LicenceKind.VARIATION &&
        !(config.hardStopEnabled && licence.isInHardStopPeriod),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals
    const { user } = res.locals
    await this.licenceService.updateAppointmentTime(licenceId, req.body, user)

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
