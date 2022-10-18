import { Response, Request } from 'express'
import LicenceService from '../../../services/licenceService'

export default class PolicyChangesNoticeRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals

    const changedConditions = await this.licenceService.getPolicyChanges(licenceId, user)
    const numberOfChanges = changedConditions.length

    req.session.changedConditions = changedConditions.sort((a: any, b: any) => (a.sequence > b.sequence ? 1 : -1))
    req.session.changedConditionsCounter = 0

    res.render('pages/vary/policyChanges', { numberOfChanges })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params

    return res.redirect(`/licence/vary/id/${licenceId}/policy-changes/callback`)
  }
}
