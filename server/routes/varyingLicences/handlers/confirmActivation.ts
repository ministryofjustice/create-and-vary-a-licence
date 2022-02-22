import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class ConfirmActivationRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/confirmActivationQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user } = res.locals

    if (answer === YesOrNo.NO) {
      return res.redirect(`/licence/vary/id/${licenceId}/view`)
    }

    const oldLicenceId = res.locals.licence.variationOf

    await Promise.all([
      this.licenceService.updateStatus(oldLicenceId, LicenceStatus.INACTIVE, user),
      this.licenceService.updateStatus(licenceId, LicenceStatus.ACTIVE, user),
    ])

    return res.redirect(`/licence/vary/id/${licenceId}/activation-confirmation`)
  }
}
