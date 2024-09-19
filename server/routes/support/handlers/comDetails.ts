import { Request, Response } from 'express'
import type ProbationService from '../../../services/probationService'
import { nameToString } from '../../../data/deliusClient'

export default class ComDetailsRoutes {
  constructor(private readonly probationService: ProbationService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { staffCode } = req.params
    const staffDetails = await this.probationService.getStaffDetailByStaffCode(staffCode)

    res.render('pages/support/comDetails', {
      name: nameToString(staffDetails.name),
      telephone: staffDetails.telephoneNumber,
      email: staffDetails.email,
      staffCode: staffDetails.code,
    })
  }
}
