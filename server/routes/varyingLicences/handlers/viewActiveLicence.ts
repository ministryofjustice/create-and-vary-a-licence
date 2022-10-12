import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { additionalConditionsCollection } from '../../../utils/conditionsProvider'

export default class ViewActiveLicenceRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    // If not still ACTIVE then redirect back to the vary timeline
    if (licence.statusCode !== LicenceStatus.ACTIVE) {
      return res.redirect(`/licence/vary/id/${licence.id}/timeline`)
    }

    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)

    const { conditionsWithUploads, additionalConditions } = additionalConditionsCollection(
      licence.additionalLicenceConditions
    )

    return res.render('pages/vary/viewActive', {
      conditionsWithUploads,
      additionalConditions,
      callToActions: { shouldShowVaryButton },
    })
  }
}
