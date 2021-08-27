import { Request, Response } from 'express'

export default class AdditionalConditionsRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/additionalConditions', { offender })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    res.redirect(`/licence/create/id/${id}/bespoke-conditions-question`)
  }
}
