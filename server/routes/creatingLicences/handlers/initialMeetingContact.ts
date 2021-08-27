import { Request, Response } from 'express'

export default class InitialMeetingContactRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/initialMeetingContact', {})
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    res.redirect(`/licence/create/id/${id}/initial-meeting-time`)
  }
}
