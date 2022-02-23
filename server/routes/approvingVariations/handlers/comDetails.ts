import { Request, Response } from 'express'
import CommunityService from '../../../services/communityService'

export default class ComDetailsRoutes {
  constructor(private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { comUsername } = res.locals.licence

    const staffDetails = await this.communityService.getStaffDetailByUsername(comUsername)

    res.render('pages/comDetails', {
      returnLink: '/licence/vary-approve/list',
      name: `${staffDetails.staff?.forenames} ${staffDetails.staff?.surname}`.trim(),
      telephone: `${staffDetails.telephoneNumber}`,
      email: `${staffDetails.email}`,
    })
  }
}
