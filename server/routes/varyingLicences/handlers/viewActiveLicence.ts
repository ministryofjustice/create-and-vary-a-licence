import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ConditionService from '../../../services/conditionService'
import LicenceService from '../../../services/licenceService'

export default class ViewActiveLicenceRoutes {
  constructor(private readonly conditionService: ConditionService, private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { isInPssPeriod = false } = licence

    // If not still ACTIVE then redirect back to the vary timeline
    if (licence.statusCode !== LicenceStatus.ACTIVE) {
      return res.redirect(`/licence/vary/id/${licence.id}/timeline`)
    }

    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)

    const conditionsToDisplay = await this.licenceService.getParentOrSelfAdditionalLicenceConditions(licence, user)

    const { conditionsWithUploads, additionalConditions } =
      this.conditionService.additionalConditionsCollection(conditionsToDisplay)

    return res.render('pages/vary/viewActive', {
      additionalConditions,
      conditionsWithUploads,
      isInPssPeriod,
      callToActions: { shouldShowVaryButton },
    })
  }
}
