import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class AccessRestrictedDelius {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { crn } = req.params

    const caseAccessDetails = await this.licenceService.checkComCaseAccess({ crn }, user)
    return res.render('pages/accessRestrictedDelius', { caseAccessDetails })
  }
}
