import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import DateTime from '../types/dateTime'
import LicenceType from '../../../enumeration/licenceType'
import UserType from '../../../enumeration/userType'
import AppointmentTimeType from '../../../enumeration/appointmentTimeType'
import flashInitialApptUpdatedMessage from './initialMeetingUpdatedFlashMessage'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'

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
      skipUrl: this.getNextPage(licence, req),
      canSkip: !licence.appointmentTimeType,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    await this.licenceService.updateAppointmentTime(licenceId, req.body, user)

    flashInitialApptUpdatedMessage(req, licence, this.userType)

    return res.redirect(this.getNextPage(licence, req))
  }

  getNextPage = (licence: Licence, request: Request): string => {
    if (this.userType === UserType.PRISON) {
      return `/licence/view/id/${licence.id}/show`
    }
    if (request.query?.fromReview) {
      return `/licence/create/id/${licence.id}/check-your-answers`
    }
    if (licence.kind === LicenceKind.HDC) {
      return `/licence/create/id/${licence.id}/hdc/standard-curfew-hours-question`
    }
    if (licence.typeCode === LicenceType.AP || licence.typeCode === LicenceType.AP_PSS) {
      return `/licence/create/id/${licence.id}/additional-licence-conditions-question`
    }
    return `/licence/create/id/${licence.id}/additional-pss-conditions-question`
  }
}
