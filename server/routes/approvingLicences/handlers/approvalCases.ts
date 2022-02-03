import { Request, Response } from 'express'
import moment from 'moment'
import CaseloadService from '../../../services/caseloadService'

export default class ApprovalCaseRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string

    const { user } = res.locals
    const cases = await this.caseloadService.getApproverCaseload(user)
    const caseloadViewModel = cases
      .map(c => {
        return {
          licenceId: c.licenceId,
          name: `${c.forename} ${c.surname}`.trim(),
          prisonNumber: c.nomisId,
          probationPractitioner: `${c.comFirstName} ${c.comLastName}`.trim(),
          releaseDate: moment(c.conditionalReleaseDate, 'DD/MM/YYYY').format('DD MMM YYYY'),
        }
      })
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.name.toLowerCase().includes(searchString) ||
          c.prisonNumber?.toLowerCase().includes(searchString) ||
          c.probationPractitioner.toLowerCase().includes(searchString)
        )
      })
    res.render('pages/approve/cases', { cases: caseloadViewModel, search })
  }
}
