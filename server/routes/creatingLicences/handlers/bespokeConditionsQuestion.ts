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
      return res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions`)
    }
    return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
