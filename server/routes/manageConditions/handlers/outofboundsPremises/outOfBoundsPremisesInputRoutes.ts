import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'

export default class OutOfBoundsPremisesInputRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { conditionId } = req.params
    const { user, licence } = res.locals

    const { code } = licence.additionalLicenceConditions.find(c => c.id === parseInt(conditionId, 10))

    let redirect = `/licence/create/id/${licenceId}/additional-licence-conditions/condition/${code}/outofbounds-premises`
    if (req.query?.fromPolicyReview) {
      redirect += '?fromPolicyReview=true'
    } else if (req.query?.fromReview) {
      redirect += '?fromReview=true'
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

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-licence-conditions/condition/${condition.code}/outofbounds-premises`
    )
  }
}
