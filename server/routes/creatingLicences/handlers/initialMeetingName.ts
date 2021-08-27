import { Request, Response } from 'express'

export default class InitialMeetingNameRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/initialMeetingName', { offender })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const id = 1
    res.redirect(`/licence/create/id/${id}/initial-meeting-place`)
  }
}
