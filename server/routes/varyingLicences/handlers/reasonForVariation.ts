import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class ReasonForVariationRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/reasonForVariation')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { reasonForVariation } = req.body
    const { user } = res.locals

    await this.licenceService.updateReasonForVariation(licenceId, { reasonForVariation }, user)

    return res.redirect(`/licence/vary/id/${licenceId}/summary`)
  }
}
