import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class VloDiscussionRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/vloDiscussion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user } = res.locals

    await this.licenceService.updateVloDiscussion(licenceId, { vloDiscussion: answer }, user)

    return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
