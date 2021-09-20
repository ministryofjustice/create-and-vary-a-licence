import { Request, Response } from 'express'

export default class InitialMeetingNameRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/initialMeetingPerson', { offender })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const licenceId = 1
    res.redirect(`/licence/create/id/${licenceId}/initial-meeting-place`)
  }
}
