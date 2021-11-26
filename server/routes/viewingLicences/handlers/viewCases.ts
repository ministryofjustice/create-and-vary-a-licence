import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import statusConfig from '../../../licences/licenceStatus'

export default class ViewAndPrintCaseRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { username, prisonCaseload, deliusStaffIdentifier: staffId, authSource } = res.locals.user
    const cases = await this.licenceService.getLicencesForCaseAdmin(username, authSource, prisonCaseload, staffId)
    res.render('pages/view/cases', { cases, statusConfig })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.body
    res.redirect(`/licence/view/id/${licenceId}/show`)
  }
}
