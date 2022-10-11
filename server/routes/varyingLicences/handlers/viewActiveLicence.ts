import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'

export default class ViewActiveLicenceRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    // If not still ACTIVE then redirect back to the vary timeline
    if (licence.statusCode !== LicenceStatus.ACTIVE) {
      return res.redirect(`/licence/vary/id/${licence.id}/timeline`)
    }

    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)

    const conditionsWithUploads = licence.additionalLicenceConditions.filter(
      (condition: AdditionalCondition) => condition?.uploadSummary?.length > 0
    )

    const additionalConditions = licence.additionalLicenceConditions.filter(
      (c: AdditionalCondition) => !conditionsWithUploads.find((c2: AdditionalCondition) => c.id === c2.id)
    )

    return res.render('pages/vary/viewActive', {
      conditionsWithUploads,
      additionalConditions,
      callToActions: { shouldShowVaryButton },
    })
  }
}
