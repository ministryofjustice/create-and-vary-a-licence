import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { jsonToSimpleDateTime } from '../../../utils/utils'
import LicenceType from '../../../enumeration/licenceType'

export default class InitialMeetingTimeRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { appointmentTime } = res.locals.licence
    const formDate = jsonToSimpleDateTime(appointmentTime)
    res.render('pages/create/initialMeetingTime', { formDate })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals
    const { username } = res.locals.user

    await this.licenceService.updateAppointmentTime(licenceId, req.body, username)

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    if (licence.typeCode === LicenceType.AP || licence.typeCode === LicenceType.AP_PSS) {
      return res.redirect(`/licence/create/id/${licenceId}/additional-licence-conditions-question`)
    }

    return res.redirect(`/licence/create/id/${licenceId}/additional-pss-conditions-question`)
  }
}
