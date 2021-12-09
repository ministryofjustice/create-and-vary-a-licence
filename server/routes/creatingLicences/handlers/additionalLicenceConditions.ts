import { Request, Response } from 'express'
import { getGroupedAdditionalConditions } from '../../../utils/conditionsProvider'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'

export default class AdditionalLicenceConditionsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const additionalConditions = getGroupedAdditionalConditions(LicenceType.AP)
    return res.render('pages/create/additionalLicenceConditions', { additionalConditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals

    // The LicenceType.AP is specified to differentiate the conditions from PSS conditions (ok for AP or AP_PSS)
    await this.licenceService.updateAdditionalConditions(licenceId, LicenceType.AP, req.body, user)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
