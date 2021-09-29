import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'

export default class BespokeConditionsQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/bespokeConditionsQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    if (answer === YesOrNo.YES) {
      res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }
  }
}
