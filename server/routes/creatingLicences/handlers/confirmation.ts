import { Request, Response } from 'express'

export default class ConfirmationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
      prison: 'Brixton Prison',
    }
    res.render('pages/create/confirmation', { offender })
  }
}
