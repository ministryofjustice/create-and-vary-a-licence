import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'
import YesOrNoQuestion from '../types/yesOrNo'

export default class BespokeConditionsQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/bespokeConditionsQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const payload = req.body as YesOrNoQuestion
    if (payload.answer === YesOrNo.YES) {
      res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }
  }
}
