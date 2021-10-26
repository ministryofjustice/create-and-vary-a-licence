import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import { getAdditionalConditionByCode } from '../../../utils/conditionsProvider'

export default class AdditionalConditionInputRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { additionalConditions } = res.locals.licence
    const { additionalConditionId } = req.params
    const additionalCondition = additionalConditions.find(
      (condition: AdditionalCondition) => condition.id === +additionalConditionId
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
    const { additionalConditionId } = req.params
    const { username } = req.user

    await this.licenceService.updateAdditionalConditionData(licenceId, additionalConditionId, req.body, username)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-conditions/callback${req.query?.fromReview ? '?fromReview=true' : ''}`
    )
  }
}
