import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import { getAdditionalConditionByCode } from '../../../utils/conditionsProvider'

export default class AdditionalPssConditionInputRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { additionalPssConditions } = res.locals.licence
    const { conditionId } = req.params
    const additionalCondition = additionalPssConditions.find(
      (condition: AdditionalCondition) => condition.id === +conditionId
    )

    const config = getAdditionalConditionByCode(additionalCondition.code)
    return res.render('pages/create/additionalPssConditionInput', { additionalCondition, config })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { conditionId } = req.params
    const { username } = req.user

    await this.licenceService.updateAdditionalConditionData(licenceId, conditionId, req.body, username)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-pss-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
