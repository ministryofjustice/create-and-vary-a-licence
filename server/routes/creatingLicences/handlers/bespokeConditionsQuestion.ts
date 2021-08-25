import { Request, Response } from 'express'

export default class BespokeConditionsQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/bespokeConditionsQuestion', { offender })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload = req.body
    if (payload['bespoke-conditions-required'] === 'yes') {
      res.redirect(`/licence/create/id/${id}/bespoke-conditions`)
    } else {
      res.redirect(`/licence/create/id/${id}/check-your-answers`)
    }
  }
}
