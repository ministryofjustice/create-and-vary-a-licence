import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import YesOrNo from '../../../enumeration/yesOrNo'

export default class ConfirmAmendVariationRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/confirmAmendVariation')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user } = res.locals

    if (answer === YesOrNo.YES) {
      await this.licenceService.editVariation(licenceId, user)
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/view`)
  }
}
