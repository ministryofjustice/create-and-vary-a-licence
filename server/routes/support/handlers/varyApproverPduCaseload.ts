import { Request, Response } from 'express'
import VaryApproverCaseloadService from '../../../services/lists/varyApproverCaseloadService'
import type { VaryApproverCase } from '../../../@types/licenceApiClientTypes'
import ProbationService from '../../../services/probationService'

type CaseWithNomisId = VaryApproverCase & { nomisId: string }

export default class VaryApproverPduCaseloadRoutes {
  constructor(
    private readonly probationService: ProbationService,
    private readonly varyApproverCaseloadService: VaryApproverCaseloadService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { pdu, mode } = req.query

    const probationPduCodes = (pdu as string)?.split(',')
    let caseload: CaseWithNomisId[] = []
    if (probationPduCodes && probationPduCodes.length > 0) {
      const cases = await this.varyApproverCaseloadService.getVaryApproverCaseload(
        {
          ...user,
          probationPduCodes,
        },
        null,
        mode !== 'old',
      )
      const crns = cases.map(aCase => aCase.crnNumber)
      const deliusRecords = await this.probationService.getProbationers(crns)
      caseload = cases.map(aCase => {
        return {
          ...aCase,
          nomisId: deliusRecords.find(d => d.crn === aCase.crnNumber)?.nomisId,
        }
      })
    }
    return res.render('pages/support/variationApproverCaseload', { caseload })
  }
}
