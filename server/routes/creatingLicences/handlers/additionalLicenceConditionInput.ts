import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import { getAdditionalConditionByCode } from '../../../utils/conditionsProvider'

export default class AdditionalLicenceConditionInputRoutes {
  constructor(private readonly licenceService: LicenceService) {}

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

    const config = getAdditionalConditionByCode(additionalCondition.code)
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
    const redirect =
      isFileUploadRequest || 'outOfBoundArea' in req.body
        ? `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${code}/file-uploads`
        : `/licence/create/id/${licenceId}/additional-licence-conditions/callback${
            req.query?.fromReview ? '?fromReview=true' : ''
          }`

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

    await this.licenceService.deleteAdditionalCondition(parseInt(conditionId, 10), licence.id, user)

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
