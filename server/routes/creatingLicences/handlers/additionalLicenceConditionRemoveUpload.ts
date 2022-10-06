import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'

export default class AdditionalLicenceConditionRemoveUploadRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals
    const { conditionId } = req.params

    const condition = licence.additionalLicenceConditions.find(
      (c: AdditionalCondition) => c.id === parseInt(conditionId, 10)
    )

    // when removing file upload, redirect to file-uploads controller
    const redirect =
      condition.uploadSummary.length > 0
        ? `/licence/create/id/${licence.id}/additional-licence-conditions/condition/${condition.code}/file-uploads`
        : `back`
    console.dir(condition, { depth: null })
    console.log(redirect, 'SDSD')
    await this.licenceService.deleteAdditionalCondition(parseInt(conditionId, 10), parseInt(licence.id, 10), user)
    return res.redirect(redirect)
  }
}
