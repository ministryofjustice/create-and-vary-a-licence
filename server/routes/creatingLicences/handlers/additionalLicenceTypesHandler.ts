import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class AdditionalLicenceTypesHandler {
  constructor(private readonly licenceService: LicenceService) {}

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals
    const { conditionCode } = req.body
    await this.licenceService.deleteAdditionalConditionsByCode(conditionCode, licence, user)
    return res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
  }
}
