import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'

export default class ViewAndPrintLicenceRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    if (
      licence?.statusCode === LicenceStatus.APPROVED ||
      licence?.statusCode === LicenceStatus.ACTIVE ||
      licence?.statusCode === LicenceStatus.SUBMITTED ||
      licence?.statusCode === LicenceStatus.REJECTED
    ) {
      const expandedLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
      const expandedPssConditions = expandAdditionalConditions(licence.additionalPssConditions)
      res.render('pages/view/view', { expandedLicenceConditions, expandedPssConditions })
    } else {
      res.redirect(`/licence/view/cases`)
    }
  }
}
