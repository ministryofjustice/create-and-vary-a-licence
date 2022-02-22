import { Request, Response } from 'express'

export default class ActivationConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/activationConfirmation')
  }
}
