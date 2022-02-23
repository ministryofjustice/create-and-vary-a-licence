import { Request, Response } from 'express'
import moment from 'moment'
import CaseloadService from '../../../services/caseloadService'

export default class VaryApproveListRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string
    const { user } = res.locals

    const licences = await this.caseloadService.getVaryApproverCaseload(user)

    const caseloadViewModel = licences
      .map(licence => {
        return {
          licenceId: licence.licenceId,
          name: [licence.forename, licence.surname].join(' '),
          crnNumber: licence.crn,
          licenceType: licence.licenceType,
          releaseDate: moment(licence.actualReleaseDate, 'DD/MM/YYYY').format('DD MMM YYYY'),
          probationPractitioner: [licence.comFirstName, licence.comLastName].join(' '),
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
    res.render('pages/vary-approve/cases', { caseload: caseloadViewModel, search })
  }
}
