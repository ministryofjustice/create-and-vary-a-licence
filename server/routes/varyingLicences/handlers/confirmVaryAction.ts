import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'

export default class ConfirmVaryActionRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/confirmVaryQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user, licence } = res.locals

    if (answer === YesOrNo.NO) {
      if (licence.isReviewNeeded) {
        return res.redirect(`/licence/vary/id/${licenceId}/have-you-reviewed-this-licence`)
      }
      return res.redirect(`/licence/vary/id/${licenceId}/view-active`)
    }

    const newLicence = await this.licenceService.getOrCreateLicenceVariation(licence.nomsId, licenceId, user)
    return res.redirect(`/licence/vary/id/${newLicence.licenceId}/spo-discussion`)
  }
}
