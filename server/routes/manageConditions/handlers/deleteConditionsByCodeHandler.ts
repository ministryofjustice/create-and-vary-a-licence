import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class DeleteConditionsByCodeHandler {
  constructor(private readonly licenceService: LicenceService) {}

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals
    const { conditionCode } = req.params
    await this.licenceService.deleteAdditionalConditionsByCode([conditionCode], licence.id, user)
    if (req.query?.fromPolicyReview) {
      return res.redirect(
        `/licence/vary/id/${licence.id}/policy-changes/input/callback/${
          +req.session.changedConditionsInputsCounter + 1
        }`,
      )
    }

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-licence-conditions/callback${
        req.query?.fromReview ? '?fromReview=true' : ''
      }`,
    )
  }
}
