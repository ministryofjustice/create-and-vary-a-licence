import { Request, Response } from 'express'
import CommunityService from '../../../services/communityService'

export default class ComDetailsRoutes {
  constructor(private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { staffId } = req.params
    const { user } = res.locals

    const staffDetails = await this.communityService.getStaffDetailByStaffIdentifier(staffId as unknown as number)

    const isInCurrentUsersTeam =
      staffDetails.teams?.find(team => user.probationTeamCodes?.includes(team.code)) !== undefined

    if (!isInCurrentUsersTeam) {
      return res.redirect('/access-denied')
    }

    return res.render('pages/comDetails', {
      returnLink: '/licence/create/caseload',
      name: `${staffDetails.staff?.forenames} ${staffDetails.staff?.surname}`.trim(),
      telephone: staffDetails.telephoneNumber,
      email: staffDetails.email,
    })
  }
}
