import { Request, Response } from 'express'
import moment from 'moment'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'
import statusConfig from '../../../licences/licenceStatus'

export default class CaseloadRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query.view === 'team'
    const search = req.query.search as string
    const { user } = res.locals

    const licences = teamView
      ? await this.caseloadService.getTeamVaryCaseload(user)
      : await this.caseloadService.getStaffVaryCaseload(user)

    const caseloadViewModel = licences
      .map(licence => {
        return {
          licenceId: licence.licenceId,
          name: convertToTitleCase([licence.forename, licence.surname].join(' ')),
          crnNumber: licence.crn,
          licenceType: licence.licenceType,
          releaseDate: moment(licence.actualReleaseDate, 'DD/MM/YYYY').format('DD MMM YYYY'),
          licenceStatus: licence.licenceStatus,
          probationPractitioner: convertToTitleCase([licence.comFirstName, licence.comLastName].join(' ')),
        }
      })
      .filter(offender => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          offender.crnNumber?.toLowerCase().includes(searchString) ||
          offender.name.toLowerCase().includes(searchString) ||
          offender.probationPractitioner.toLowerCase().includes(searchString)
        )
      })
    res.render('pages/vary/caseload', { caseload: caseloadViewModel, statusConfig, search, teamView })
  }
}
