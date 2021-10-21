import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'

export default class AdditionalConditionsQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/additionalConditionsQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    if (answer === YesOrNo.YES) {
      return res.redirect(`/licence/create/id/${licenceId}/additional-conditions`)
    }

    return res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions-question`)
  }
}
