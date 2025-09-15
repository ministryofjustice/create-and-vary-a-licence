import { Request, Response } from 'express'
import CaCaseloadService from '../../../services/lists/caCaseloadService'

export default class PrrdCasesByPrisonRoutes {
  constructor(private readonly caCaseloadService: CaCaseloadService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals

    const cases = await this.caCaseloadService.getPrisonOmuCaseload(
      {
        ...user,
      },
      [user.activeCaseload],
    )

    const caseload = cases
      .filter(aCase => aCase.releaseDateKind === 'PRRD')
      .map(aCase => ({
        ...aCase,
        probationPractitioner: aCase.probationPractitioner.name,
      }))
    return res.render('pages/support/prrdCasesByPrison', { caseload, user })
  }
}
