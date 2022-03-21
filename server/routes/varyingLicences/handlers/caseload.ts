import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import CaseloadService from '../../../services/caseloadService'
import statusConfig from '../../../licences/licenceStatus'
import { convertToTitleCase } from '../../../utils/utils'

export default class CaseloadRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query.view === 'team'
    const search = req.query.search as string
    const { user } = res.locals

    const cases = teamView
      ? await this.caseloadService.getTeamVaryCaseload(user)
      : await this.caseloadService.getStaffVaryCaseload(user)

    const caseloadViewModel = cases
      .map(c => {
        return {
          licenceId: _.head(c.licences).id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          crnNumber: c.deliusRecord.otherIds.crn,
          licenceType: _.head(c.licences).type,
          releaseDate: moment(c.nomisRecord.releaseDate, 'YYYY-MM-DD').format('DD MMM YYYY'),
          licenceStatus: _.head(c.licences).status,
          probationPractitioner: c.probationPractitioner,
        }
      })
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.crnNumber?.toLowerCase().includes(searchString) ||
          c.name.toLowerCase().includes(searchString) ||
          c.probationPractitioner?.name.toLowerCase().includes(searchString)
        )
      })
    res.render('pages/vary/caseload', { caseload: caseloadViewModel, statusConfig, search, teamView })
  }
}
