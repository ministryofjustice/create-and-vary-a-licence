import { Request, Response } from 'express'
import { getGroupedAdditionalConditions } from '../../../utils/conditionsProvider'
import LicenceService from '../../../services/licenceService'

export default class AdditionalConditionsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const additionalConditions = getGroupedAdditionalConditions()
    return res.render('pages/create/additionalConditions', { additionalConditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { username } = req.user

    await this.licenceService.updateAdditionalConditions(licenceId, req.body, username)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-conditions/callback${req.query?.fromReview ? '?fromReview=true' : ''}`
    )
  }
}
