import { Request, Response } from 'express'
import CaseloadService from '../../../services/caseloadService'
import createCaseloadViewModel from '../../views/CaseloadViewModel'

export default class ProbationTeamRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string
    const { teamCode } = req.params

    const { user } = res.locals

    const caseload = await this.caseloadService.getTeamCreateCaseload(user, [teamCode])
    const caseloadViewModel = createCaseloadViewModel(caseload, search)
    res.json(caseloadViewModel)
  }
}
