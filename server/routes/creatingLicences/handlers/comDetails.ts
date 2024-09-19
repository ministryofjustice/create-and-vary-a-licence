import { Request, Response } from 'express'
import ProbationService from '../../../services/probationService'
import { nameToString } from '../../../data/deliusClient'

export default class ComDetailsRoutes {
  constructor(private readonly probationService: ProbationService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { staffCode } = req.params
    const { user } = res.locals

    const staffDetails = await this.probationService.getStaffDetailByStaffCode(staffCode)

    const isInCurrentUsersTeam =
      staffDetails.teams?.find(team => user.probationTeamCodes?.includes(team.code)) !== undefined
    const backLink = req.session.returnToCase

    if (!isInCurrentUsersTeam) {
      return res.redirect('/access-denied')
    }

    return res.render('pages/comDetails', {
      returnLink: backLink,
      name: nameToString(staffDetails.name),
      telephone: staffDetails.telephoneNumber,
      email: staffDetails.email,
    })
  }
}
