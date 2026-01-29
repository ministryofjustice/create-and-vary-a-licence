import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import FileUploadType from '../../../../enumeration/fileUploadType'
import { AdditionalCondition } from '../../../../@types/licenceApiClientTypes'
import { mapToTargetField } from '../../../../utils/utils'

export default class FileUploadInputRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly fileUploadType: FileUploadType,
  ) {}

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { conditionId } = req.params
    const { user, licence } = res.locals

    const { code } = licence.additionalLicenceConditions.find(
      (c: AdditionalCondition) => c.id === parseInt(conditionId, 10),
    )

    let redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/callback`

    if (this.fileUploadType === FileUploadType.MULTI_INSTANCE) {
      redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${code}/file-uploads`
    }

    if (req.query?.fromPolicyReview) {
      // This hijacks the policy review loop to allow users to review each instance of a changed multi-instance upload condition.
      if (this.fileUploadType === FileUploadType.MULTI_INSTANCE) {
        const instanceToReview = licence.additionalLicenceConditions.find((c: AdditionalCondition) => {
          return c.code === code && c.version !== licence.version && c.id.toString() !== conditionId
        })
        if (instanceToReview) {
          redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${instanceToReview.id}`
        }
      }
      redirect += '?fromPolicyReview=true'
    } else if (req.query?.fromReview) {
      redirect += '?fromReview=true'
    }

    if (req.file) {
      await this.licenceService.uploadExclusionZoneFile(licenceId, conditionId, req.file, user)
    }
    const condition = licence.additionalLicenceConditions.find(
      (c: AdditionalCondition) => c.id === parseInt(conditionId, 10),
    )
    await this.licenceService.updateAdditionalConditionData(licenceId, condition, mapToTargetField(req.body), user)

    return res.redirect(redirect)
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { conditionId } = req.params
    const { user } = res.locals

    const condition = licence.additionalLicenceConditions.find(
      (c: AdditionalCondition) => c.id === parseInt(conditionId, 10),
    )

    await this.licenceService.deleteAdditionalCondition(parseInt(conditionId, 10), licence.id, user)

    let append = ''

    if (req.query?.fromPolicyReview) {
      append = '?fromPolicyReview=true'
    } else if (req.query?.fromReview) {
      append += '?fromReview=true'
    }

    if (this.fileUploadType === FileUploadType.MULTI_INSTANCE) {
      return res.redirect(
        `/licence/create/id/${licence.id}/additional-licence-conditions/condition/${condition.code}/file-uploads${append}`,
      )
    }

    return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions/callback${append}`)
  }
}
