import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class InitialMeetingNameRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    res.render('pages/create/initialMeetingPerson', {
      releaseIsOnBankHolidayOrWeekend: licence.isEligibleForEarlyRelease,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    await this.licenceService.updateAppointmentPerson(licenceId, req.body, user)

    if (req.query?.fromReview) {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/initial-meeting-place`)
    }
  }
}
