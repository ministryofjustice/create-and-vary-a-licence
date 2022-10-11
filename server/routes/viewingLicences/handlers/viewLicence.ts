import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'

export default class ViewAndPrintLicenceRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
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

      const conditionsWithUploads = licence.additionalLicenceConditions.filter(
        (condition: AdditionalCondition) => condition?.uploadSummary?.length > 0
      )

      const additionalConditions = licence.additionalLicenceConditions.filter(
        (c: AdditionalCondition) => !conditionsWithUploads.find((c2: AdditionalCondition) => c.id === c2.id)
      )

      res.render('pages/view/view', { conditionsWithUploads, additionalConditions })
    } else {
      res.redirect(`/licence/view/cases`)
    }
  }
}
