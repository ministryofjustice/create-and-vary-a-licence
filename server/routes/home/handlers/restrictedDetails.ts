import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { CrnParams } from '../../types/routeParams'

export default class RestrictedDetails {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request<CrnParams>, res: Response): Promise<void> => {
    const { crn } = req.params
    const { user } = res.locals

    const { message } = await this.licenceService.getCaseAccessDetails(crn, user)

    res.render('pages/restrictedDetails', { crn, message, isVaryJourney: req.query.vary })
  }
}
