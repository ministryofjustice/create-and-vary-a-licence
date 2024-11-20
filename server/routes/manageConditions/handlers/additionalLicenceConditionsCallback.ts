import { Request, Response } from 'express'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'
import { getConditionCallbackHref } from '../../../utils/conditionRoutes'

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
      }),
    )

    const requiringInput = licence.additionalLicenceConditions
      .filter((condition: AdditionalCondition) => conditionCodesRequiringInput.includes(condition.code))
      .sort((a: AdditionalCondition, b: AdditionalCondition) => (a.sequence > b.sequence ? 1 : -1))
      .find((condition: AdditionalCondition) => condition.data.length === 0)

    if (requiringInput) {
      return res.redirect(
        getConditionCallbackHref({
          licenceId,
          conditionId: requiringInput.id,
          conditionCode: requiringInput.code,
          fromReview: !!req.query?.fromReview,
        }),
      )
    }

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }
    return res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions-question`)
  }
}
