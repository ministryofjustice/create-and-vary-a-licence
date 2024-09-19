import { Request, Response } from 'express'
import ProbationService from '../../../services/probationService'
import { nameToString } from '../../../data/deliusClient'

export default class ComDetailsRoutes {
  constructor(private readonly probationService: ProbationService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { comUsername } = res.locals.licence

    const staffDetails = await this.probationService.getStaffDetailByUsername(comUsername)

    const backLink = req.session.returnToCase

    res.render('pages/comDetails', {
      returnLink: backLink,
      name: nameToString(staffDetails.name),
      telephone: staffDetails.telephoneNumber,
      email: staffDetails.email,
    })
  }
}
