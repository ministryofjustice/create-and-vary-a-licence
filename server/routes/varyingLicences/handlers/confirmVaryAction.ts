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
    const { user } = res.locals

    if (answer === YesOrNo.NO) {
      return res.redirect(`/licence/vary/id/${licenceId}/view`)
    }

    const newLicence = await this.licenceService.createVariation(licenceId, user)

    return res.redirect(`/licence/vary/id/${newLicence.licenceId}/spo-discussion`)
  }
}
