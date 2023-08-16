import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ConditionService from '../../../services/conditionService'
import LicenceService from '../../../services/licenceService'
import { hasAuthSource } from '../../../utils/utils'

export default class ViewAndPrintLicenceRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const showConditionCountSelectedText = hasAuthSource(req.user, 'delius')
    if (
      licence?.statusCode === LicenceStatus.APPROVED ||
      licence?.statusCode === LicenceStatus.ACTIVE ||
      licence?.statusCode === LicenceStatus.SUBMITTED ||
      licence?.statusCode === LicenceStatus.REJECTED ||
      licence?.statusCode === LicenceStatus.IN_PROGRESS
    ) {
      if (licence?.comStaffId !== user?.deliusStaffIdentifier) {
        // Recorded here as we do not know the reason for fetchLicence in the API
        await this.licenceService.recordAuditEvent(
          `Licence viewed for ${licence.forename} ${licence.surname}`,
          `ID ${licence.id} type ${licence.typeCode} status ${licence.statusCode} version ${licence.version}`,
          licence.id,
          new Date(),
          user
        )
      }

      const { conditionsWithUploads, additionalConditions } = this.conditionService.additionalConditionsCollection(
        licence.additionalLicenceConditions
      )

      res.render('pages/view/view', {
        conditionsWithUploads,
        additionalConditions,
        showConditionCountSelectedText,
      })
    } else {
      res.redirect(`/licence/view/cases`)
    }
  }
}
