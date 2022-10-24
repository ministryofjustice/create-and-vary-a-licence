import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'
import ConditionService from '../../../services/conditionService'

export default class AdditionalPssConditionsRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const additionalConditions = await this.conditionService.getGroupedAdditionalConditions(
      LicenceType.PSS,
      licence.version
    )
    return res.render('pages/create/additionalPssConditions', { additionalConditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals

    await this.licenceService.updateAdditionalConditions(licenceId, LicenceType.PSS, req.body, user, licence.version)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-pss-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
