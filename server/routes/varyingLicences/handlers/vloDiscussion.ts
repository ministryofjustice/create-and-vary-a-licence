import { Request, Response } from 'express'
import ConditionService from '../../../services/conditionService'
import LicenceService from '../../../services/licenceService'

export default class VloDiscussionRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/vloDiscussion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user } = res.locals

    await this.licenceService.updateVloDiscussion(licenceId, { vloDiscussion: answer }, user)

    if (
      (await this.licenceService.getParentLicenceOrSelf(parseInt(licenceId, 10), user)).version !==
      (await this.conditionService.getPolicyVersion())
    ) {
      return res.redirect(`/licence/vary/id/${licenceId}/policy-changes`)
    }

    return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
