import { Request, Response } from 'express'

export default class ActivatingLicenceAfterVariationReminderController {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/activatingLicenceAfterVariationReminderPage', {})
  }
}
