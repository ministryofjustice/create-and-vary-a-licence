import { Request, Response } from 'express'
import { getGroupedAdditionalConditions } from '../../../utils/conditionsProvider'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'

export default class AdditionalLicenceConditionsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const additionalConditions = getGroupedAdditionalConditions()
    return res.render('pages/create/additionalLicenceConditions', { additionalConditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { username } = req.user

    await this.licenceService.updateAdditionalConditions(licenceId, LicenceType.AP, req.body, username)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
