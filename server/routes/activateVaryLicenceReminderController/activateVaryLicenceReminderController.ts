import { Request, Response } from 'express'

export default class ActivateVaryLicenceReminderController {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/activateVaryLicenceReminderPage', {})
  }
}
