import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import FileUploadType from '../../../../enumeration/fileUploadType'
import ConditionService from '../../../../services/conditionService'

export default class FileUploadInputRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService,
    private readonly fileUploadType: FileUploadType
  ) {}

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { conditionId } = req.params
    const { user, licence } = res.locals

    const { code } = licence.additionalLicenceConditions.find(c => c.id === parseInt(conditionId, 10))

    let redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/callback`

    if (this.fileUploadType === FileUploadType.MULTI_INSTANCE) {
      redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${code}/file-uploads`
    }

    if (req.query?.fromPolicyReview) {
      // This hijacks the policy review loop to allow users to review the removal of multiple MEZ map names.
      // Perhaps more importantly, it also results in the removal of the map names from the database.
      // It's pretty gross, but I couldn't think of another way to trigger removal of the names without a near-complete rewrite of the callback logic.
      if (this.fileUploadType === FileUploadType.MULTI_INSTANCE) {
        const activePoliceVersion = await this.conditionService.getPolicyVersion()
        const instanceWithName = licence.additionalLicenceConditions.find(c => {
          return c.code === code && c.version !== activePoliceVersion && c.id.toString() !== conditionId
        })
        if (instanceWithName) {
          redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${instanceWithName.id}`
        }
      }
      redirect += '?fromPolicyReview=true'
    } else if (req.query?.fromReview) {
      redirect += '?fromReview=true'
    }

    if (req.file) {
      await this.licenceService.uploadExclusionZoneFile(licenceId, conditionId, req.file, user)
    }
    const condition = licence.additionalLicenceConditions.find(c => c.id === parseInt(conditionId, 10))
    await this.licenceService.updateAdditionalConditionData(licenceId, condition, req.body, user)

    return res.redirect(redirect)
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { conditionId } = req.params
    const { user } = res.locals

    const condition = licence.additionalLicenceConditions.find(c => c.id === parseInt(conditionId, 10))

    await this.licenceService.deleteAdditionalCondition(parseInt(conditionId, 10), licence.id, user)

    let append = ''

    if (req.query?.fromPolicyReview) {
      append = '?fromPolicyReview=true'
    } else if (req.query?.fromReview) {
      append += '?fromReview=true'
    }

    if (this.fileUploadType === FileUploadType.MULTI_INSTANCE) {
      return res.redirect(
        `/licence/create/id/${licence.id}/additional-licence-conditions/condition/${condition.code}/file-uploads${append}`
      )
    }

    return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions/callback${append}`)
  }
}
