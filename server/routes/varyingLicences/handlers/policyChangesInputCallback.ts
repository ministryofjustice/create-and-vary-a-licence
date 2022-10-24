import { Request, Response } from 'express'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'

export default class PolicyChangeInputCallbackRoutes {
  constructor(private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { licenceId, changeCounter } = req.params

    const inputCounter = +changeCounter
    const changedConditionInputs = req.session.changedConditionsInputs

    // Overriding session counter for when the back link is clicked
    req.session.changedConditionsInputsCounter = inputCounter

    if (inputCounter === 0) {
      return res.redirect(
        `/licence/vary/id/${licenceId}/policy-changes/condition/${req.session.changedConditionsCounter}`
      )
    }
    if (inputCounter > changedConditionInputs.length) {
      return res.redirect(`/licence/vary/id/${licenceId}/policy-changes/callback`)
    }

    const conditionCode = changedConditionInputs[inputCounter - 1]

    const condition = licence.additionalLicenceConditions.find((c: AdditionalCondition) => c.code === conditionCode)
    const conditionType = await this.conditionService.getAdditionalConditionType(conditionCode)

    if (conditionType === 'AP') {
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${condition.id}?fromPolicyReview=true`
      )
    }
    if (conditionType === 'PSS') {
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-pss-conditions/condition/${condition.id}?fromPolicyReview=true`
      )
    }
    // If somehow the condition is neither AP nor PSS, skip it.
    return res.redirect(
      `/licence/vary/id/${licenceId}/policy-changes/input/callback/${+req.session.changedConditionsInputsCounter + 1}`
    )
  }
}
