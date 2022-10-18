import { Request, Response } from 'express'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'

export default class AdditionalPssConditionsCallbackRoutes {
  constructor(private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { additionalPssConditions } = res.locals.licence

    const conditionCodesRequiringInput = await Promise.all(
      additionalPssConditions.map(async (condition: AdditionalCondition) => {
        return (await this.conditionService.getAdditionalConditionByCode(condition.code))?.requiresInput
          ? condition.code
          : undefined
      })
    )

    const requiringInput = additionalPssConditions
      .filter((condition: AdditionalCondition) => conditionCodesRequiringInput.includes(condition.code))
      .sort((a: AdditionalCondition, b: AdditionalCondition) => (a.sequence > b.sequence ? 1 : -1))
      .find((condition: AdditionalCondition) => condition.data.length === 0)

    if (requiringInput) {
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-pss-conditions/condition/${requiringInput.id}${
          req.query?.fromReview ? '?fromReview=true' : ''
        }`
      )
    }

    return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
