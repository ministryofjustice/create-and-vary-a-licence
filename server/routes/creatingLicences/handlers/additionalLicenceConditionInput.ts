import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import { getAdditionalConditionByCode } from '../../../utils/conditionsProvider'

export default class AdditionalLicenceConditionInputRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { additionalLicenceConditions } = res.locals.licence
    const { conditionId } = req.params
    const additionalCondition = additionalLicenceConditions.find(
      (condition: AdditionalCondition) => condition.id === +conditionId
    )

    if (!additionalCondition) {
      res.status(404)
      throw new Error('Additional condition not found')
    }

    const config = getAdditionalConditionByCode(additionalCondition.code)
    return res.render('pages/create/additionalConditionInput', { additionalCondition, config })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { conditionId } = req.params
    const { username } = req.user

    await this.licenceService.updateAdditionalConditionData(licenceId, conditionId, req.body, username)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`
    )
  }
}
