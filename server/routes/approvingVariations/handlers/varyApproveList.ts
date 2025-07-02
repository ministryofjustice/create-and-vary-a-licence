import { Request, Response } from 'express'
import VaryApproverCaseloadService from '../../../services/lists/varyApproverCaseloadService'
import config from '../../../config'

export default class VaryApproveListRoutes {
  constructor(private readonly caseloadService: VaryApproverCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query?.search as string
    const regionCases = req.query?.view === 'region'
    const { user } = res.locals

    const { getAcoCaseloadFromBackEnd } = config
    const caseload = regionCases
      ? await this.caseloadService.getVaryApproverCaseloadByRegion(user, search, getAcoCaseloadFromBackEnd)
      : await this.caseloadService.getVaryApproverCaseload(user, search, getAcoCaseloadFromBackEnd)

    res.render('pages/vary-approve/cases', { caseload, search, regionCases })
  }
}
