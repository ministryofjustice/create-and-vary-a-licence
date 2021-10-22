import { Request, Response } from 'express'
import { getAdditionalConditions } from '../../../utils/conditionsProvider'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'

export default class AdditionalConditionsCallbackRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { additionalConditions } = res.locals.licence

    const additionalConditionsConfig = getAdditionalConditions()

    const requiringInput = additionalConditions
      .filter((condition: AdditionalCondition) =>
        additionalConditionsConfig.find(config => config.code === condition.code && config.requiresInput)
      )
      .sort((a: AdditionalCondition, b: AdditionalCondition) => (a.sequence > b.sequence ? 1 : -1))
      .find((condition: AdditionalCondition) => condition.data.length === 0)

    if (requiringInput) {
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-conditions/condition/${requiringInput.id}${
          req.query?.fromReview ? '?fromReview=true' : ''
        }`
      )
    }

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }
    return res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions-question`)
  }
}
