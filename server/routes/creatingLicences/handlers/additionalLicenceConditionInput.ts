import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import LicenceType from '../../../enumeration/licenceType'
import ConditionService from '../../../services/conditionService'

export default class AdditionalLicenceConditionInputRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { additionalLicenceConditions } = res.locals.licence
    const { conditionId } = req.params

    const additionalCondition = additionalLicenceConditions.find(
      (condition: AdditionalCondition) => condition.id === +conditionId
    )

    if (!additionalCondition) {
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-licence-conditions${
          req.query?.fromReview ? '?fromReview=true' : ''
        }`
      )
    }

    const config = await this.conditionService.getAdditionalConditionByCode(additionalCondition.code)

    if (req.query?.fromPolicyReview) {
      const policyChangeInputCounter = +req.session.changedConditionsInputsCounter
      return res.render('pages/create/additionalLicenceConditionInput', {
        additionalCondition,
        config,
        policyChangeInputCounter,
      })
    }

    return res.render('pages/create/additionalLicenceConditionInput', { additionalCondition, config })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { conditionId } = req.params
    const { user, licence } = res.locals

    // Check for file uploads on specific forms
    if (req.file && req.file.fieldname === 'outOfBoundFilename') {
      await this.licenceService.uploadExclusionZoneFile(licenceId, conditionId, req.file, user)
    }

    const condition = licence.additionalLicenceConditions.find((c: AdditionalCondition) => c.id === +conditionId)
    await this.licenceService.updateAdditionalConditionData(licenceId, condition, req.body, user)

    if (req.query?.fromPolicyReview) {
      return res.redirect(
        `/licence/vary/id/${licenceId}/policy-changes/input/callback/${+req.session.changedConditionsInputsCounter + 1}`
      )
    }

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { conditionId } = req.params
    const { user } = res.locals

    const additionalConditionCodes = licence.additionalLicenceConditions
      .filter((condition: AdditionalCondition) => condition.id !== parseInt(conditionId, 10))
      .map((condition: AdditionalCondition) => condition.code)

    await this.licenceService.updateAdditionalConditions(
      licence.id,
      LicenceType.AP,
      { additionalConditions: additionalConditionCodes },
      user
    )

    if (req.query?.fromPolicyReview) {
      return res.redirect(
        `/licence/vary/id/${licence.id}/policy-changes/input/callback/${
          +req.session.changedConditionsInputsCounter + 1
        }`
      )
    }

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
