import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ConditionService from '../../../services/conditionService'
import LicenceService from '../../../services/licenceService'
import { isInPssPeriod } from '../../../utils/utils'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'

export default class ViewActiveLicenceRoutes {
  constructor(private readonly conditionService: ConditionService, private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    let additionalConditions
    let conditionsWithUploads: AdditionalCondition[]

    // If not still ACTIVE then redirect back to the vary timeline
    if (licence.statusCode !== LicenceStatus.ACTIVE) {
      return res.redirect(`/licence/vary/id/${licence.id}/timeline`)
    }

    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)

    ;({ conditionsWithUploads, additionalConditions } = this.conditionService.additionalConditionsCollection(
      licence.additionalLicenceConditions
    ))

    const inPssPeriod = isInPssPeriod(licence)

    if (inPssPeriod) {
      ;({ conditionsWithUploads, additionalConditions } = this.conditionService.additionalConditionsCollection(
        (await this.licenceService.getParentLicenceOrSelf(licence.id, user))?.additionalLicenceConditions
      ))
    }

    return res.render('pages/vary/viewActive', {
      additionalConditions,
      conditionsWithUploads,
      inPssPeriod,
      callToActions: { shouldShowVaryButton },
    })
  }
}
