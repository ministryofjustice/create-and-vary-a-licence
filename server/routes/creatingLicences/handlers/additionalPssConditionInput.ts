import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import { getAdditionalConditionByCode } from '../../../utils/conditionsProvider'
import LicenceType from '../../../enumeration/licenceType'

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
    const { user, licence } = res.locals

    const condition = licence.additionalPssConditions.find((c: AdditionalCondition) => c.id === +conditionId)
    await this.licenceService.updateAdditionalConditionData(licenceId, condition, req.body, user)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-pss-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { conditionId } = req.params
    const { user } = res.locals

    const additionalConditionCodes = licence.additionalPssConditions
      .filter((condition: AdditionalCondition) => condition.id !== parseInt(conditionId, 10))
      .map((condition: AdditionalCondition) => condition.code)

    await this.licenceService.updateAdditionalConditions(
      licence.id,
      LicenceType.PSS,
      { additionalConditions: additionalConditionCodes },
      user
    )

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-pss-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
