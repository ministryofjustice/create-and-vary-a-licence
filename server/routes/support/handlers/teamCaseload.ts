import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class TeamCaseloadRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { regionCode, teamCode } = req.params
    const { view } = req.query

    const caseload = view === 'vary' ? 
      await this.caseloadService.getTeamVaryCaseload(user, [teamCode]) :
      await this.caseloadService.getTeamCreateCaseload(user, [teamCode])

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
          _.head(c.licences).status !== LicenceStatus.OOS_BOTUS &&
          _.head(c.licences).status !== LicenceStatus.NOT_STARTED,
      }))
      .sort((a, b) => {
        const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
        const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
        return crd1 - crd2
      })
      
    res.render('pages/support/caseload', {
      caseload: caseloadViewModel,
      statusConfig,
      regionCode,
      teamCode,
      teamName: req.session.supportTeamName
    })
  }
}
