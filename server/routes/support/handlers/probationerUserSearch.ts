import { Request, Response } from 'express'
import _ from 'lodash'
import moment from 'moment'
import CommunityService from '../../../services/communityService'
import { convertToTitleCase } from '../../../utils/utils'
import CaseloadService from '../../../services/caseloadService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'

export default class ProbationerUserSearchRoutes {
  constructor(private readonly caseloadService: CaseloadService, private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { teamName, teamCode, deliusStaffIdentifier } = req.params
    const { user } = res.locals
    user.deliusStaffIdentifier = deliusStaffIdentifier
    const caseload = await this.caseloadService.getTeamCreateCaseload(user, [teamCode])
    const caseloadViewModel = caseload
      .map(c => ({
        name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
        crnNumber: c.deliusRecord.offenderCrn,
        prisonerNumber: c.nomisRecord.prisonerNumber,
        releaseDate: moment(c.nomisRecord.releaseDate || c.nomisRecord.conditionalReleaseDate).format('DD MMM YYYY'),
        licenceId: _.head(c.licences).id,
        licenceStatus: _.head(c.licences).status,
        licenceType: _.head(c.licences).type,
        probationPractitioner: c.probationPractitioner,
        isClickable:
          c.probationPractitioner !== undefined &&
          _.head(c.licences).status !== LicenceStatus.NOT_IN_PILOT &&
          _.head(c.licences).status !== LicenceStatus.OOS_RECALL &&
          _.head(c.licences).status !== LicenceStatus.OOS_BOTUS,
      }))
      .sort((a, b) => {
        const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
        const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
        return crd1 - crd2
      })
    return res.render('pages/support/probationerTeamSearch', { teamName, caseload: caseloadViewModel, statusConfig })
  }
}
