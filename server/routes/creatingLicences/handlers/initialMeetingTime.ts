import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import DateTime from '../types/dateTime'
import LicenceType from '../../../enumeration/licenceType'

export default class InitialMeetingTimeRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const formDate = DateTime.toDateTime(licence.appointmentTime)
    res.render('pages/create/initialMeetingTime', {
      formDate,
      releaseIsOnBankHolidayOrWeekend: licence.isEligibleForEarlyRelease,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals
    const { user } = res.locals

    await this.licenceService.updateAppointmentTime(licenceId, req.body, user)

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    if (licence.typeCode === LicenceType.AP || licence.typeCode === LicenceType.AP_PSS) {
      return res.redirect(`/licence/create/id/${licenceId}/additional-licence-conditions-question`)
    }

    return res.redirect(`/licence/create/id/${licenceId}/additional-pss-conditions-question`)
  }
}
