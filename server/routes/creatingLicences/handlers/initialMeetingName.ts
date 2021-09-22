import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class InitialMeetingNameRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/initialMeetingPerson')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { username } = res.locals.user

    await this.licenceService.updateAppointmentPerson(licenceId, req.body, username)
    res.redirect(`/licence/create/id/${licenceId}/initial-meeting-place`)
  }
}
