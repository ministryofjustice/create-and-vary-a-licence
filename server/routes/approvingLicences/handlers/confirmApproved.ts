import { Request, Response } from 'express'
import ProbationService from '../../../services/probationService'
import { convertToTitleCase } from '../../../utils/utils'

export default class ConfirmApprovedRoutes {
  constructor(private readonly probationService: ProbationService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { comUsername } = res.locals.licence
    const comDetails = await this.probationService.getStaffDetailByUsername(comUsername)
    const fullName = convertToTitleCase(`${licence.forename || ''} ${licence.surname || ''}`.trim())

    res.render('pages/approve/confirmation', {
      fullName,
      isComEmailAvailable: comDetails?.email != null,
    })
  }
}
