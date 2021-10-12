import { Request, Response } from 'express'
import moment from 'moment'
import LicenceService from '../../../services/licenceService'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'

export default class CaseloadRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const caseload = await this.caseloadService.getStaffCaseload(res.locals.user.username)

    const caseloadViewModel = caseload.map(offender => {
      return {
        name: convertToTitleCase([offender.firstName, offender.lastName].join(' ')),
        crnNumber: offender.crnNumber,
        prisonerNumber: offender.prisonerNumber,
        conditionalReleaseDate: moment(offender.conditionalReleaseDate, 'YYYY-MM-DD').format('Do MMMM YYYY'),
      }
    })
    res.render('pages/create/caseload', { caseload: caseloadViewModel })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { prisonerNumber } = req.body

    // TODO: This block is temporary, remove this when we have a design for editing existing licences
    const comLicenses = await this.licenceService.getLicencesByStaffIdAndStatus(2000, username, [])
    const existingLicense = comLicenses.find(licence => licence.nomisId === prisonerNumber)
    if (existingLicense) {
      return res.redirect(`/licence/create/id/${existingLicense.licenceId}/check-your-answers`)
    }

    const { licenceId } = await this.licenceService.createLicence(prisonerNumber, username)
    return res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
  }
}
