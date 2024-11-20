import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import ConditionService from '../../../services/conditionService'
import { groupingBy } from '../../../utils/utils'

export default class LicenceChangesNotApprovedInTimeRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly conditionService: ConditionService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const backLink = req.session.returnToCase || '/licence/create/caseload'
    const { email } = await this.licenceService.getOmuEmail(licence.prisonCode, user)

    const conditionsToDisplay = await this.conditionService.getAdditionalAPConditionsForSummaryAndPdf(licence, user)

    return res.render('pages/create/licenceChangesNotApprovedInTime', {
      licence,
      omuEmail: email,
      additionalConditions: groupingBy(conditionsToDisplay, 'code'),
      backLink,
    })
  }
}
