import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class ViewAndPrintCaseRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string

    const { user } = res.locals
    const cases = await this.caseloadService.getOmuCaseload(user)
    const caseloadViewModel = cases
      .map(c => {
        return {
          licenceId: _.head(c.licences).id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          releaseDate: moment(c.nomisRecord.conditionalReleaseDate, 'YYYY-MM-DD').format('DD MMM YYYY'),
          licenceStatus: _.head(c.licences).status,
          isClickable:
            _.head(c.licences).status !== LicenceStatus.NOT_STARTED &&
            _.head(c.licences).status !== LicenceStatus.NOT_IN_PILOT &&
            _.head(c.licences).status !== LicenceStatus.IN_PROGRESS,
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
    res.render('pages/view/cases', { cases: caseloadViewModel, statusConfig, search })
  }
}
