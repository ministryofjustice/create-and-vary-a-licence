import { Request, Response } from 'express'
import type CommunityService from '../../../services/communityService'

export default class ComDetailsRoutes {
  constructor(private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { staffCode } = req.params
    const staffDetails = await this.communityService.getStaffDetailByStaffCode(staffCode)

    res.render('pages/support/comDetails', {
      name: `${staffDetails.staff?.forenames} ${staffDetails.staff?.surname}`.trim(),
      telephone: staffDetails.telephoneNumber,
      email: staffDetails.email,
      staffCode: staffDetails.staffCode,
    })
  }
}
