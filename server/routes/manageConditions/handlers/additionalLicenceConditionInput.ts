import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import ConditionService from '../../../services/conditionService'
import { getConfigForCondition } from '../../../utils/conditionRoutes'

export default class AdditionalLicenceConditionInputRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals
    const { conditionId } = req.params

    const additionalCondition = licence.additionalLicenceConditions.find(condition => condition.id === +conditionId)

    if (!additionalCondition) {
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-licence-conditions${
          req.query?.fromReview ? '?fromReview=true' : ''
        }`
      )
    }

    const config = await this.conditionService.getAdditionalConditionByCode(additionalCondition.code, licence.version)

    const policyReview = this.getPolicyReviewState(req)
    const conditionConfg = getConfigForCondition(additionalCondition.code)
    return res.render(conditionConfg.inputTemplate, { additionalCondition, config, policyReview })
  }

  private getPolicyReviewState = (req: Request) => {
    if (req.query?.fromPolicyReview) {
      const policyChangeInputCounter = +req.session.changedConditionsInputsCounter
      const conditionCounter = req.session.changedConditionsCounter
      const policyChangesCount = req.session.changedConditions.length
      return { policyChangeInputCounter, conditionCounter, policyChangesCount }
    }
    return undefined
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { conditionId } = req.params
    const { user, licence } = res.locals

    let redirect
    if (req.query?.fromPolicyReview) {
      redirect = `/licence/vary/id/${licenceId}/policy-changes/input/callback/${
        +req.session.changedConditionsInputsCounter + 1
      }`
    } else {
      redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    }

    const condition = licence.additionalLicenceConditions.find(c => c.id === +conditionId)
    await this.licenceService.updateAdditionalConditionData(licenceId, condition, req.body, user)

    return res.redirect(redirect)
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { conditionId } = req.params
    const { user } = res.locals

    let redirect
    if (req.query?.fromPolicyReview) {
      redirect = `/licence/vary/id/${licence.id}/policy-changes/input/callback/${
        +req.session.changedConditionsInputsCounter + 1
      }`
    } else {
      redirect = `/licence/create/id/${licence.id}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    }

    await this.licenceService.deleteAdditionalCondition(parseInt(conditionId, 10), licence.id, user)

    return res.redirect(redirect)
  }

  SKIP = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals
    const { conditionId } = req.params

    const condition = licence.additionalLicenceConditions.find(c => c.id === parseInt(conditionId, 10))
    const conditionData = { conditionSkipped: '[DATE REQUIRED]' }
    await this.licenceService.updateAdditionalConditionData(licence.id.toString(), condition, conditionData, user)

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
