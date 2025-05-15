import { Request, Response } from 'express'
import ProbationService from '../../../services/probationService'
import { nameToString } from '../../../data/deliusClient'

export default class ComDetailsRoutes {
  constructor(private readonly probationService: ProbationService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { staffCode } = req.params
    const staffDetails = await this.probationService.getStaffDetailByStaffCode(staffCode)
    const activeTabToRedirect = req.query?.activeTab ? `#${req.query?.activeTab}` : ''

    res.render('pages/comDetails', {
      returnLink: `/licence/view/cases${activeTabToRedirect}`,
      name: nameToString(staffDetails.name),
      telephone: staffDetails.telephoneNumber,
      email: staffDetails.email,
    })
  }
}
