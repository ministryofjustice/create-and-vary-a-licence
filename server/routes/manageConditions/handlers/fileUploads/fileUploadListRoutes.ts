import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import { AddAdditionalConditionRequest } from '../../../../@types/licenceApiClientTypes'
import conditionType from '../../../../enumeration/conditionType'
import YesOrNo from '../../../../enumeration/yesOrNo'
import ConditionService from '../../../../services/conditionService'

export default class FileUploadListRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId, conditionCode } = req.params
    const { licence } = res.locals

    const conditions = licence.additionalLicenceConditions.filter(c => c.code === conditionCode)

    if (conditions.length === 0) {
      if (req.query?.fromPolicyReview) {
        return res.redirect(
          `/licence/vary/id/${licenceId}/policy-changes/input/callback/${
            +req.session.changedConditionsInputsCounter + 1
          }`
        )
      }
      return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions/callback?fromReview=true`)
    }

    return res.render('pages/manageConditions/fileUploads/list', {
      conditions,
      licenceId,
      conditionType,
      displayMessage: null,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    const { uploadFile, conditionCode } = req.body

    const condition = await this.conditionService.getAdditionalConditionByCode(conditionCode, licence.version)
    const type = await this.conditionService.getAdditionalConditionType(conditionCode, licence.version)

    if (!uploadFile) {
      const displayMessage = { text: 'Select yes or no' }
      const conditions = licence.additionalLicenceConditions.filter(c => c.code === conditionCode)
      return res.render('pages/manageConditions/fileUploads/list', {
        conditions,
        licenceId,
        conditionType,
        displayMessage,
      })
    }

    if (uploadFile !== YesOrNo.YES) {
      if (req.query?.fromPolicyReview) {
        return res.redirect(
          `/licence/vary/id/${licenceId}/policy-changes/input/callback/${
            +req.session.changedConditionsInputsCounter + 1
          }`
        )
      }

      return res.redirect(
        `/licence/create/id/${licenceId}/additional-licence-conditions/callback${
          req.query?.fromReview ? '?fromReview=true' : ''
        }`
      )
    }

    const sequence = this.conditionService.currentOrNextSequenceForCondition(
      licence.additionalLicenceConditions,
      conditionCode
    )

    const request = {
      conditionCode,
      conditionCategory: condition?.categoryShort || condition?.category,
      conditionText: condition.text,
      conditionType: type,
      expandedText: condition.tpl,
      sequence,
    } as AddAdditionalConditionRequest

    const conditionResult = await this.licenceService.addAdditionalCondition(licenceId, type, request, user)

    if (req.query?.fromPolicyReview) {
      return res.redirect(
        `/licence/vary/id/${licenceId}/policy-changes/input/callback/${+req.session.changedConditionsInputsCounter + 1}`
      )
    }
    return res.redirect(
      `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${conditionResult.id}?fromReview=true`
    )
  }
}
