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
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-conditions${req.query?.fromReview ? '?fromReview=true' : ''}`
      )
    }

    // TODO Remove any additional conditions which may exist on the licence - i.e. if they arrive here from check answers page

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    return res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions-question`)
  }
}
