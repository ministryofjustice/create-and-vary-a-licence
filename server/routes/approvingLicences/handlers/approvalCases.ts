import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'

export default class ApprovalCaseRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string

    const { user } = res.locals
    const cases = await this.caseloadService.getApproverCaseload(user)
    const caseloadViewModel = cases
      .map(c => {
        return {
          licenceId: _.head(c.licences).id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          releaseDate: moment(c.nomisRecord.releaseDate || c.nomisRecord.conditionalReleaseDate).format('DD MMM YYYY'),
        }
      })
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.name.toLowerCase().includes(searchString) ||
          c.prisonerNumber?.toLowerCase().includes(searchString) ||
          c.probationPractitioner?.name.toLowerCase().includes(searchString)
        )
      })
      .sort((a, b) => {
        const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
        const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
        return crd1 - crd2
      })
    res.render('pages/approve/cases', { cases: caseloadViewModel, search })
  }
}
