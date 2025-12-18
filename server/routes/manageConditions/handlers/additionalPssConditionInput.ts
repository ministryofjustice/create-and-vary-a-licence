import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'
import LicenceType from '../../../enumeration/licenceType'
import ConditionService from '../../../services/conditionService'

export default class AdditionalPssConditionInputRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { licenceId } = req.params
    const { conditionId } = req.params
    const additionalCondition = licence.additionalPssConditions.find(
      (condition: AdditionalCondition) => condition.id === +conditionId,
    )

    if (!additionalCondition) {
      return res.redirect(
        `/licence/create/id/${licenceId}/additional-pss-conditions${req.query?.fromReview ? '?fromReview=true' : ''}`,
      )
    }

    const config = await this.conditionService.getAdditionalConditionByCode(additionalCondition.code, licence.version)
    return res.render('pages/manageConditions/additionalPssConditionInput', { additionalCondition, config })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { conditionId } = req.params
    const { user, licence } = res.locals

    const condition = licence.additionalPssConditions.find((c: AdditionalCondition) => c.id === +conditionId)
    await this.licenceService.updateAdditionalConditionData(licenceId, condition, req.body, user)

    return res.redirect(
      `/licence/create/id/${licenceId}/additional-pss-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`,
    )
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { conditionId } = req.params
    const { user } = res.locals

    const additionalConditionCodes = licence.additionalPssConditions
      .filter((condition: AdditionalCondition) => condition.id !== parseInt(conditionId, 10))
      .map((condition: AdditionalCondition) => condition.code)

    await this.licenceService.updateAdditionalConditions(
      licence.id,
      LicenceType.PSS,
      { additionalConditions: additionalConditionCodes },
      user,
      licence.version,
    )

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-pss-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`,
    )
  }

  SKIP = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals
    const { conditionId } = req.params

    const condition = licence.additionalPssConditions.find(
      (c: AdditionalCondition) => c.id === parseInt(conditionId, 10),
    )
    const conditionData = { conditionSkipped: '[DATE REQUIRED]' }
    await this.licenceService.updateAdditionalConditionData(licence.id.toString(), condition, conditionData, user)

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-pss-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`,
    )
  }
}
