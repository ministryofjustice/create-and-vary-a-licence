import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'
import AdditionalConditions from '../types/additionalConditions'

export default class AdditionalConditionsQuestionRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/additionalConditionsQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { username } = req.user
    const { answer } = req.body
    if (answer === YesOrNo.YES) {
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-conditions${req.query?.fromReview ? '?fromReview=true' : ''}`
      )
    }

    await this.licenceService.updateAdditionalConditions(
      licenceId,
      { additionalConditions: [] } as AdditionalConditions,
      username
    )

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    return res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions-question`)
  }
}
