import { Request, Response } from 'express'
import CommunityService from '../../../services/communityService'

export default class ComDetailsRoutes {
  constructor(private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { staffCode } = req.params
    const { user } = res.locals

    const staffDetails = await this.communityService.getStaffDetailByStaffCode(staffCode)

    const isInCurrentUsersTeam =
      staffDetails.teams?.find(team => user.probationTeamCodes?.includes(team.code)) !== undefined

<<<<<<< HEAD
    const backLink = req.session.returnToCase
=======
    const backLinkHref = req.session.returnTo
>>>>>>> cb43f66 (CVSL-990-Returns user to wrong place after submitting)

    if (!isInCurrentUsersTeam) {
      return res.redirect('/access-denied')
    }

    return res.render('pages/comDetails', {
<<<<<<< HEAD
      returnLink: backLink,
=======
      returnLink: backLinkHref,
>>>>>>> cb43f66 (CVSL-990-Returns user to wrong place after submitting)
      name: `${staffDetails.staff?.forenames} ${staffDetails.staff?.surname}`.trim(),
      telephone: staffDetails.telephoneNumber,
      email: staffDetails.email,
    })
  }
}
