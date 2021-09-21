import { Request, Response } from 'express'

export default class InitialMeetingNameRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/initialMeetingPerson')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const licenceId = 1
    res.redirect(`/licence/create/id/${licenceId}/initial-meeting-place`)
  }
}
