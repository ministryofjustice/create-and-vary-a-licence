import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'

export default class LicenceReviewRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (_: Request, res: Response): Promise<void> => {
    res.render('pages/vary/reviewLicence')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user } = res.locals

    if (answer === YesOrNo.YES) {
      return res.redirect(`/licence/vary/id/${licenceId}/confirm-vary-action`)
    }
    req.flash('showTimeServedImproveServiceBanner', 'true')

    await this.licenceService.reviewWithoutVariation(parseInt(licenceId, 10), user)

    return res.redirect(`/licence/vary/id/${licenceId}/timeline`)
  }
}
