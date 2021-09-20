import { Request, Response } from 'express'

export default class AdditionalConditionsQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const offender = {
      name: 'Adam Balasaravika',
    }
    res.render('pages/create/additionalConditionsQuestion', { offender })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const payload = req.body
    if (payload.answer === 'yes') {
      res.redirect(`/licence/create/id/${licenceId}/additional-conditions`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions-question`)
    }
  }
}
