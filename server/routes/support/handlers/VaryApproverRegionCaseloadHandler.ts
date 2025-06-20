import { Request, Response } from 'express'
import VaryApproverCaseloadService from '../../../services/lists/varyApproverCaseloadService'
import { VaryApproverCase } from '../../../@types/licenceApiClientTypes'

export default class VaryApproverRegionCaseloadHandler {
  constructor(private readonly varyApproverCaseloadService: VaryApproverCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { region, mode } = req.query

    let caseload: VaryApproverCase[] = []
    if (region)
      caseload = await this.varyApproverCaseloadService.getVaryApproverCaseloadByRegion(
        {
          ...user,
          probationAreaCode: region as string,
        },
        null,
        mode !== 'old',
      )
    return res.render('pages/support/variationApproverPduCases', { caseload })
  }
}
