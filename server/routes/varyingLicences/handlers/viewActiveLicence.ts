import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ConditionService from '../../../services/conditionService'
import { groupingBy } from '../../../utils/utils'
import HdcService from '../../../services/hdcService'
import LicenceKind from '../../../enumeration/LicenceKind'

export default class ViewActiveLicenceRoutes {
  constructor(
    private readonly conditionService: ConditionService,
    private readonly hdcService: HdcService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals

    // If not still ACTIVE then redirect back to the vary timeline
    if (licence.statusCode !== LicenceStatus.ACTIVE) {
      return res.redirect(`/licence/vary/id/${licence.id}/timeline`)
    }

    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)

    const conditionsToDisplay = await this.conditionService.getAdditionalAPConditionsForSummaryAndPdf(licence, user)

    const bespokeConditionsToDisplay = await this.conditionService.getbespokeConditionsForSummaryAndPdf(licence, user)

    const hdcLicenceData = licence.kind === LicenceKind.HDC ? await this.hdcService.getHdcLicenceData(licence.id) : null

    return res.render('pages/vary/viewActive', {
      additionalConditions: groupingBy(conditionsToDisplay, 'code'),
      bespokeConditionsToDisplay,
      callToActions: { shouldShowVaryButton },
      hdcLicenceData,
    })
  }
}
