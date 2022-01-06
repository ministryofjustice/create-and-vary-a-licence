import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class AdditionalLicenceConditionRemoveUploadRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId, conditionId } = req.params
    await this.licenceService.removeExclusionZoneFile(licenceId, conditionId, user)
    return res.redirect('back')
  }
}
