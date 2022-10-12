import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import {
  currentOrNextSequenceForCondition,
  getAdditionalConditionByCode,
  getAdditionalConditionType,
} from '../../../utils/conditionsProvider'
import { AddAdditionalConditionRequest } from '../../../@types/licenceApiClientTypes'
import conditionType from '../../../enumeration/conditionType'

export default class AdditionalLicenceConditionUploadsHandler {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId, conditionCode } = req.params
    const { user } = res.locals
    const licence = await this.licenceService.getLicence(licenceId, user)

    const conditions = licence.additionalLicenceConditions.filter(c => c.code === conditionCode)

    if (conditions.length === 0) {
      return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions/callback?fromReview=true`)
    }

    return res.render('pages/create/fileUploads', { conditions, licenceId, conditionType })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const { uploadFile, conditionCode } = req.body

    const condition = getAdditionalConditionByCode(conditionCode)
    const type = getAdditionalConditionType(conditionCode)

    if (uploadFile !== 'yes') {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
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
}
