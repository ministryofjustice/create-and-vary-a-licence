import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'
import LicenceService from '../../../services/licenceService'

export default class ViewAndPrintLicenceRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    if (
      licence?.statusCode === LicenceStatus.APPROVED ||
      licence?.statusCode === LicenceStatus.ACTIVE ||
      licence?.statusCode === LicenceStatus.SUBMITTED ||
      licence?.statusCode === LicenceStatus.REJECTED
    ) {
      const expandedLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
      const expandedPssConditions = expandAdditionalConditions(licence.additionalPssConditions)

      await this.licenceService.recordAuditEvent(
        `Viewed licence for ${licence.forename} ${licence.surname}`,
        `Viewed licence ID ${licence.id} type ${licence.typeCode} version ${licence.version}`,
        licence.id,
        new Date(),
        user
      )

      res.render('pages/view/view', { expandedLicenceConditions, expandedPssConditions })
    } else {
      res.redirect(`/licence/view/cases`)
    }
  }
}
