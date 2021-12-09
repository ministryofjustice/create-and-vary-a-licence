import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class ApprovalCaseRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const cases = await this.licenceService.getLicencesForApproval(user)
    res.render('pages/approve/cases', { cases })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.body
    res.redirect(`/licence/approve/id/${licenceId}/view`)
  }
}
