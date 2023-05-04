import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import YesOrNo from '../../../enumeration/yesOrNo'

export default class ConfirmDiscardVariationRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/confirmDiscardVariation')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user } = res.locals
<<<<<<< HEAD
    const backLink = req.session.returnToCase

    if (answer === YesOrNo.YES) {
      await this.licenceService.discard(licenceId, user)
      return res.redirect(backLink)
=======
    const backLinkHref = req.session.returnTo

    if (answer === YesOrNo.YES) {
      await this.licenceService.discard(licenceId, user)
      return res.redirect(backLinkHref)
>>>>>>> cb43f66 (CVSL-990-Returns user to wrong place after submitting)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/view`)
  }
}
