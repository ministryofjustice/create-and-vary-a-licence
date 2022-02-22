import { Request, Response } from 'express'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class ViewVariationRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    if (licence.statusCode === LicenceStatus.VARIATION_IN_PROGRESS) {
      return res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
    }

    const expandedLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
    const expandedPssConditions = expandAdditionalConditions(licence.additionalPssConditions)

    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)
    const shouldShowActivateButton = [LicenceStatus.VARIATION_APPROVED].includes(<LicenceStatus>licence.statusCode)
    const shouldShowEditAndDiscardButton = [
      LicenceStatus.VARIATION_SUBMITTED,
      LicenceStatus.VARIATION_APPROVED,
      LicenceStatus.VARIATION_REJECTED,
    ].includes(<LicenceStatus>licence.statusCode)

    return res.render('pages/vary/viewVariation', {
      expandedLicenceConditions,
      expandedPssConditions,
      callToActions: { shouldShowVaryButton, shouldShowActivateButton, shouldShowEditAndDiscardButton },
    })
  }
}
