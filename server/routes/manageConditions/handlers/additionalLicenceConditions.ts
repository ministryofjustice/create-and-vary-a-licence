import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'
import ConditionService from '../../../services/conditionService'

export default class AdditionalLicenceConditionsRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const additionalConditions = await this.conditionService.getGroupedAdditionalConditions(
      LicenceType.AP,
      licence.version
    )
    return res.render('pages/manageConditions/additionalLicenceConditions', { additionalConditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals

    // The LicenceType.AP is specified to differentiate the conditions from PSS conditions (ok for AP or AP_PSS)
    await this.licenceService.updateAdditionalConditions(
      parseInt(licenceId, 10),
      LicenceType.AP,
      req.body,
      user,
      licence.version
    )

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
