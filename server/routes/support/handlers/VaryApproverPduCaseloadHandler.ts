import { Request, Response } from 'express'
import VaryApproverCaseloadService from '../../../services/lists/varyApproverCaseloadService'
import type { VaryApproverCase } from '../../../@types/licenceApiClientTypes'

export default class VaryApproverPduCaseloadHandler {
  constructor(private readonly varyApproverCaseloadService: VaryApproverCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { pdu, mode } = req.query

    const probationPduCodes = (pdu as string)?.split(',')
    let caseload: VaryApproverCase[] = []
    if (probationPduCodes && probationPduCodes.length > 0) {
      caseload = await this.varyApproverCaseloadService.getVaryApproverCaseload(
        {
          ...user,
          probationPduCodes,
        },
        null,
        mode !== 'old',
      )
    }
    return res.render('pages/support/variationApproverPduCases', { caseload })
  }
}
