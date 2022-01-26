import _ from 'lodash'

import LicenceService from '../../../services/licenceService'
import { DomainEvent } from '../../../@types/events'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class ReleaseEventHandler {
  constructor(private readonly licenceService: LicenceService) {}

  handle = async (event: DomainEvent): Promise<void> => {
    if (event.additionalInformation?.reason === 'RELEASED') {
      const nomisId = event.additionalInformation.nomsNumber
      const licence = _.head(
        await this.licenceService.getLicencesByNomisIdsAndStatus(
          [nomisId],
          [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
        )
      )

      if (licence) {
        if (licence.licenceStatus === LicenceStatus.APPROVED) {
          await this.licenceService.updateStatus(licence.licenceId.toString(), LicenceStatus.ACTIVE)
        } else {
          await this.licenceService.updateStatus(licence.licenceId.toString(), LicenceStatus.INACTIVE)
        }
      }
    }
  }
}
