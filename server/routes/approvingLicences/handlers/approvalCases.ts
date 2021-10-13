import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class ApprovalCaseRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    // TODO: Get prison caseload - this will come from stored values in the user session (populateCurrentUser)
    const prisonCaseload = ['MDI', 'LEI', 'BMI']
    const cases = await this.licenceService.getLicencesForApproval(username, prisonCaseload)
    res.render('pages/approve/cases', { cases })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.body
    res.redirect(`/licence/approve/id/${licenceId}/view`)
  }
}
