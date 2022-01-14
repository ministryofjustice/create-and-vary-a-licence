import { Request, Response } from 'express'
import moment from 'moment'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'
import statusConfig from '../../../licences/licenceStatus'

export default class CaseloadRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const licences = await this.caseloadService.getVaryCaseload(user)
    const caseloadViewModel = licences.map(licence => {
      return {
        licenceId: licence.licenceId,
        name: convertToTitleCase([licence.forename, licence.surname].join(' ')),
        crnNumber: licence.crn,
        licenceType: licence.licenceType,
        releaseDate: moment(licence.actualReleaseDate, 'YYYY-MM-DD').format('Do MMMM YYYY'),
        licenceStatus: licence.licenceStatus,
      }
    })
    res.render('pages/vary/caseload', { caseload: caseloadViewModel, statusConfig })
  }
}
