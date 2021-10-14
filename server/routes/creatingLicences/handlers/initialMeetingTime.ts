import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { jsonToSimpleDateTime } from '../../../utils/utils'

export default class InitialMeetingTimeRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { appointmentTime } = res.locals.licence
    const formDate = jsonToSimpleDateTime(appointmentTime)
    res.render('pages/create/initialMeetingTime', { formDate })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { username } = res.locals.user
    await this.licenceService.updateAppointmentTime(licenceId, req.body, username)

    if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/additional-conditions-question`)
    }
  }
}
