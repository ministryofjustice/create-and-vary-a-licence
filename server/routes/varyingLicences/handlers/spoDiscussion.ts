import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class SpoDiscussionRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/spoDiscussion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user } = res.locals

    await this.licenceService.updateSpoDiscussion(licenceId, { spoDiscussion: answer }, user)

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/vlo-discussion`)
  }
}
