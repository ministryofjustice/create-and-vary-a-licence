import { Request, Response } from 'express'
import YesOrNoQuestion from '../types/yesOrNo'
import YesOrNo from '../../../enumeration/yesOrNo'

export default class AdditionalConditionsQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/additionalConditionsQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const payload = req.body as YesOrNoQuestion
    if (payload.answer === YesOrNo.YES) {
      res.redirect(`/licence/create/id/${licenceId}/additional-conditions`)
    } else {
      res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions-question`)
    }
  }
}
