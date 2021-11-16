import { Request, Response } from 'express'
import { getAdditionalConditionByCode } from '../../../utils/conditionsProvider'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'

export default class AdditionalPssConditionsCallbackRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { additionalPssConditions } = res.locals.licence

    const requiringInput = additionalPssConditions
      .filter((condition: AdditionalCondition) => getAdditionalConditionByCode(condition.code)?.requiresInput)
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
