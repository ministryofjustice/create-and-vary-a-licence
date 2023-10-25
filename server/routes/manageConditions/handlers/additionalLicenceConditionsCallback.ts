import { Request, Response } from 'express'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import { CURFEW_CONDITION_CODE } from '../../../utils/conditionRoutes'

export default class AdditionalLicenceConditionsCallbackRoutes {
  constructor(private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals

    const conditionCodesRequiringInput = await Promise.all(
      licence.additionalLicenceConditions.map(async (condition: AdditionalCondition) => {
        return (await this.conditionService.getAdditionalConditionByCode(condition.code, licence.version))
          ?.requiresInput
          ? condition.code
          : undefined
      })
    )

    const requiringInput = licence.additionalLicenceConditions
      .filter((condition: AdditionalCondition) => conditionCodesRequiringInput.includes(condition.code))
      .sort((a: AdditionalCondition, b: AdditionalCondition) => (a.sequence > b.sequence ? 1 : -1))
      .find((condition: AdditionalCondition) => condition.data.length === 0)

    if (requiringInput) {
      if (requiringInput.code === CURFEW_CONDITION_CODE) {
        return res.redirect(
          `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${requiringInput.code}/curfew${
            req.query.fromReview ? '?fromReview=true' : ''
          }`
        )
      }
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${requiringInput.id}${
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
