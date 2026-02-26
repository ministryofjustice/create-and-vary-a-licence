import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class RestrictedDetails {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { crn } = req.params

    const { message } = await this.licenceService.getCaseAccessDetails(crn)

    res.render('pages/restrictedDetails', { crn, message })
  }
}
