import { Request, Response } from 'express'
import ProbationService from '../../../services/probationService'
import { nameToString } from '../../../data/deliusClient'

export default class ComDetailsRoutes {
  constructor(private readonly probationService: ProbationService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { comUsername } = res.locals.licence

    const staffDetails = await this.probationService.getStaffDetailByUsername(comUsername)

    res.render('pages/comDetails', {
      returnLink: '/licence/vary-approve/list',
      name: nameToString(staffDetails.name),
      telephone: staffDetails.telephoneNumber,
      email: staffDetails.email,
    })
  }
}
