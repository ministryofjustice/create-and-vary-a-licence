import { Request, Response } from 'express'
import { getGroupedAdditionalConditions } from '../../../utils/conditionsProvider'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'

export default class AdditionalPssConditionsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const additionalConditions = getGroupedAdditionalConditions(LicenceType.PSS)
    return res.render('pages/create/additionalPssConditions', { additionalConditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals

    await this.licenceService.updateAdditionalConditions(licenceId, LicenceType.PSS, req.body, user)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-pss-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
