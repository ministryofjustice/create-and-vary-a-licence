import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import {
  currentOrNextSequenceForCondition,
  getAdditionalConditionByCode,
  getAdditionalConditionType,
} from '../../../utils/conditionsProvider'
import { AddAdditionalConditionRequest, AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import conditionType from '../../../enumeration/conditionType'
import YesOrNo from '../../../enumeration/yesOrNo'

export default class AdditionalLicenceConditionUploadsHandler {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId, conditionCode } = req.params
    const { user } = res.locals
    const licence = await this.licenceService.getLicence(licenceId, user)

    const conditions = licence.additionalLicenceConditions.filter((c: AdditionalCondition) => c.code === conditionCode)

    if (conditions.length === 0) {
      return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions/callback?fromReview=true`)
    }

    return res.render('pages/create/fileUploads', { conditions, licenceId, conditionType, displayMessage: null })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const { uploadFile, conditionCode } = req.body

    const condition = getAdditionalConditionByCode(conditionCode)
    const type = getAdditionalConditionType(conditionCode)

    if (!uploadFile) {
      const displayMessage = { text: 'Select yes or no' }
      const conditions = licence.additionalLicenceConditions.filter(
        (c: AdditionalCondition) => c.code === conditionCode
      )
      return res.render('pages/create/fileUploads', { conditions, licenceId, conditionType, displayMessage })
    }

    if (uploadFile !== YesOrNo.YES) {
      return res.redirect(`/licence/create/id/${licenceId}/additional-licence-conditions/callback?fromReview=true`)
    }

    const sequence = currentOrNextSequenceForCondition(licence.additionalLicenceConditions, conditionCode)

    const request = {
      conditionCode,
      conditionCategory: condition?.categoryShort || condition?.category,
      conditionText: condition.text,
      conditionType: type,
      expandedText: condition.tpl,
      sequence,
    } as AddAdditionalConditionRequest

    const conditionResult = await this.licenceService.addAdditionalCondition(licenceId, type, request, user)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${conditionResult.id}?fromReview=true`
    )
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals
    const { conditionCode } = req.body
    await this.licenceService.deleteAdditionalCondition(conditionCode, licence, user)
    return res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
  }
}
