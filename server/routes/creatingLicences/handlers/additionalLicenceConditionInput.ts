import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import { getAdditionalConditionByCode } from '../../../utils/conditionsProvider'
import LicenceType from '../../../enumeration/licenceType'
import logger from '../../../../logger'

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
    const { user } = res.locals

    await this.licenceService.updateAdditionalConditionData(licenceId, conditionId, req.body, user)

    if (req.file) {
      // Check if there was a file upload in this POST request - only one allowed - the exclusion zone(outOfBoundFilename)
      if (req.file.fieldname === 'outOfBoundFilename') {
        logger.info(`File upload request ${JSON.stringify(req.file)} licenceId ${licenceId}, condId ${conditionId}`)
        await this.licenceService.uploadExclusionZoneFile(licenceId, conditionId, req.file, user)
      } else {
        logger.warn(
          `Attempted file upload by ${user.displayName} - ${JSON.stringify(
            req.file
          )} for licenceId ${licenceId}, condId ${conditionId}`
        )
      }
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

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
