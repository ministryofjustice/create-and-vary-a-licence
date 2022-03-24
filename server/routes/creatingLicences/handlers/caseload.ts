import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import LicenceService from '../../../services/licenceService'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'
import { prisonInRollout } from '../../../utils/rolloutUtils'
import statusConfig from '../../../licences/licenceStatus'

export default class CaseloadRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const teamView = req.query.view === 'team'
    const search = req.query.search as string

    const { user } = res.locals

    const caseload = teamView
      ? await this.caseloadService.getTeamCreateCaseload(user)
      : await this.caseloadService.getStaffCreateCaseload(user)

    const caseloadViewModel = caseload
      .map(c => {
        return {
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          crnNumber: c.deliusRecord.offenderCrn,
          prisonerNumber: c.nomisRecord.prisonerNumber,
          conditionalReleaseDate: moment(c.nomisRecord.conditionalReleaseDate, 'YYYY-MM-DD').format('DD MMM YYYY'),
          licenceStatus: _.head(c.licences).status,
          licenceType: _.head(c.licences).type,
          probationPractitioner: c.probationPractitioner,
          insidePilot: prisonInRollout(c.nomisRecord.prisonId),
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
    res.render('pages/create/caseload', { caseload: caseloadViewModel, statusConfig, teamView, search })
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
