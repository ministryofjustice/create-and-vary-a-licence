import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

class RestrictedDetailsRoutes {
  constructor(private licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { crn } = req.params
    const { message } = await this.licenceService.getCaseAccessDetails(crn)

    res.render('pages/restrictedDetails', { crn, message })
  }
}

export default RestrictedDetailsRoutes
