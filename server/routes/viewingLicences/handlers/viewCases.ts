import { Request, Response } from 'express'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'

export default class ViewAndPrintCaseRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const cases = await this.caseloadService.getOmuCaseload(user)
    res.render('pages/view/cases', { cases, statusConfig })
  }
}
