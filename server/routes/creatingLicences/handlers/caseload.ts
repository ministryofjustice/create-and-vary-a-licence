import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import LicenceService from '../../../services/licenceService'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'
import statusConfig from '../../../licences/licenceStatus'

export default class CaseloadRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query.view === 'team'

    const { user } = res.locals

    const caseload = teamView
      ? await this.caseloadService.getTeamCaseload(user)
      : await this.caseloadService.getStaffCaseload(user)

    const caseloadViewModel = caseload.map(offender => {
      return {
        name: convertToTitleCase([offender.firstName, offender.lastName].join(' ')),
        crnNumber: offender.crnNumber,
        prisonerNumber: offender.prisonerNumber,
        conditionalReleaseDate: moment(offender.conditionalReleaseDate, 'YYYY-MM-DD').format('Do MMMM YYYY'),
        licenceStatus: offender.licenceStatus,
        licenceType: offender.licenceType,
      }
    })
    res.render('pages/create/caseload', { caseload: caseloadViewModel, statusConfig, teamView })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonerNumber } = req.body

    // TODO: Which statuses should be considered "existing"? Should INACTIVE and RECALLED be included?
    const existingLicence = _.head(await this.licenceService.getLicencesByNomisIdsAndStatus([prisonerNumber], [], user))
    if (existingLicence) {
      return res.redirect(`/licence/create/id/${existingLicence.licenceId}/check-your-answers`)
    }

    const { licenceId } = await this.licenceService.createLicence(prisonerNumber, user)
    return res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
  }
}
