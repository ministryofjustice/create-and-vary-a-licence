import { Request, Response } from 'express'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class ViewActiveLicenceRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals

    // If not still ACTIVE then redirect back to the vary timeline
    if (licence.statusCode !== LicenceStatus.ACTIVE) {
      return res.redirect(`/licence/vary/id/${licence.id}/timeline`)
    }

    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)
    const expandedLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
    const expandedPssConditions = expandAdditionalConditions(licence.additionalPssConditions)

    return res.render('pages/vary/viewActive', {
      expandedLicenceConditions,
      expandedPssConditions,
      callToActions: { shouldShowVaryButton },
    })
  }
}
