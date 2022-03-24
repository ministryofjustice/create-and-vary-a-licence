import { Request, Response } from 'express'
import CommunityService from '../../../services/communityService'

export default class ComDetailsRoutes {
  constructor(private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { staffCode } = req.params
    const staffDetails = await this.communityService.getStaffDetailByStaffCode(staffCode)

    res.render('pages/comDetails', {
      returnLink: '/licence/view/cases',
      name: `${staffDetails.staff?.forenames} ${staffDetails.staff?.surname}`.trim(),
      telephone: staffDetails.telephoneNumber,
      email: staffDetails.email,
    })
  }
}
