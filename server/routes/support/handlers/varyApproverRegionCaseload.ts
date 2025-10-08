import { Request, Response } from 'express'
import VaryApproverCaseloadService from '../../../services/lists/varyApproverCaseloadService'
import { VaryApproverCase } from '../../../@types/licenceApiClientTypes'
import ProbationService from '../../../services/probationService'

type CaseWithNomisId = VaryApproverCase & { nomisId: string }

export default class VaryApproverRegionCaseloadRoutes {
  constructor(
    private readonly probationService: ProbationService,
    private readonly varyApproverCaseloadService: VaryApproverCaseloadService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { region } = req.query

    let caseload: CaseWithNomisId[] = []
    if (region) {
      const cases = await this.varyApproverCaseloadService.getVaryApproverCaseloadByRegion(
        {
          ...user,
          probationAreaCode: region as string,
        },
        null,
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
