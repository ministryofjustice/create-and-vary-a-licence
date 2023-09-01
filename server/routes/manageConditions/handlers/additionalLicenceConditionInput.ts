import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import ConditionService from '../../../services/conditionService'

export default class AdditionalLicenceConditionInputRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { licence } = res.locals
    const { conditionId } = req.params

    const additionalCondition = licence.additionalLicenceConditions.find(
      (condition: AdditionalCondition) => condition.id === +conditionId
    )

    if (!additionalCondition) {
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-licence-conditions${
          req.query?.fromReview ? '?fromReview=true' : ''
        }`
      )
    }

    const config = await this.conditionService.getAdditionalConditionByCode(additionalCondition.code, licence.version)

    if (req.query?.fromPolicyReview) {
      const policyChangeInputCounter = +req.session.changedConditionsInputsCounter
      const conditionCounter = req.session.changedConditionsCounter
      const policyChangesCount = req.session.changedConditions.length
      return res.render('pages/create/additionalLicenceConditionInput', {
        additionalCondition,
        config,
        policyChangeInputCounter,
        conditionCounter,
        policyChangesCount,
      })
    }

    return res.render('pages/create/additionalLicenceConditionInput', { additionalCondition, config })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { conditionId } = req.params
    const { user, licence } = res.locals
    const isFileUploadRequest = req.file && req.file.fieldname === 'outOfBoundFilename'

    const { code } = licence.additionalLicenceConditions.find(
      (c: AdditionalCondition) => c.id === parseInt(conditionId, 10)
    )

    // if the update involves a file or updating a data element for exclusion zone name outOfBoundArea
    let redirect
    if (isFileUploadRequest || 'outOfBoundArea' in req.body) {
      redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${code}/file-uploads`
      if (req.query?.fromPolicyReview) {
        redirect += '?fromPolicyReview=true'
      } else if (req.query?.fromReview) {
        redirect += '?fromReview=true'
      }
    } else if (req.query?.fromPolicyReview) {
      redirect = `/licence/vary/id/${licenceId}/policy-changes/input/callback/${
        +req.session.changedConditionsInputsCounter + 1
      }`
    } else {
      redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    }

    // Check for file uploads on specific forms
    if (isFileUploadRequest) {
      await this.licenceService.uploadExclusionZoneFile(licenceId, conditionId, req.file, user)
    }

    const condition = licence.additionalLicenceConditions.find((c: AdditionalCondition) => c.id === +conditionId)
    await this.licenceService.updateAdditionalConditionData(licenceId, condition, req.body, user)

    return res.redirect(redirect)
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { conditionId } = req.params
    const { user } = res.locals

    const condition = licence.additionalLicenceConditions.find(
      (c: AdditionalCondition) => c.id === parseInt(conditionId, 10)
    ) as AdditionalCondition

    // if the exclusion zone name outOfBoundArea is present, redirect to file uploads dialog
    let redirect
    if (condition.expandedText.indexOf('{outOfBoundsArea}') > 1) {
      redirect = `/licence/create/id/${licence.id}/additional-licence-conditions/condition/${condition.code}/file-uploads`
    } else if (req.query?.fromPolicyReview) {
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
}
