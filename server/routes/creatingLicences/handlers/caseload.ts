import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import CaseloadService from '../../../services/caseloadService'

export default class CaseloadRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const caseload = await this.caseloadService.getStaffCaseload(res.locals.user.username)

    const caseloadViewModel = caseload.map(offender => {
      return {
        name: [offender.firstName, offender.lastName].join(' '),
        crnNumber: offender.crnNumber,
        conditionalReleaseDate: offender.conditionalReleaseDate,
      }
    })
    res.render('pages/create/caseload', { caseload: caseloadViewModel })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licenceId } = await this.licenceService.createLicence(username)
    res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
  }
}
