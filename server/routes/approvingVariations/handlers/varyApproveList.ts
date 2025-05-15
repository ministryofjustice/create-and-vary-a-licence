import { Request, Response } from 'express'
import AcoCaseloadService from '../../../services/lists/acoCaseloadService'

export default class VaryApproveListRoutes {
  constructor(private readonly caseloadService: AcoCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query?.search as string
    const regionCases = req.query?.view === 'region'
    const { user } = res.locals

    const caseload = regionCases
      ? await this.caseloadService.getVaryApproverCaseloadByRegion(user, search)
      : await this.caseloadService.getVaryApproverCaseload(user, search)

    res.render('pages/vary-approve/cases', { caseload, search, regionCases })
  }
}
