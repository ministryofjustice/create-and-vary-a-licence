import _ from 'lodash'

import logger from '../../../../logger'
import LicenceService from '../../../services/licenceService'
import { DomainEventMessage } from '../../../@types/events'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'
import { PrisonerSearchCriteria } from '../../../@types/prisonerSearchApiClientTypes'

export default class ReleaseEventHandler {
  constructor(private readonly licenceService: LicenceService, private readonly prisonerService: PrisonerService) {}

  handle = async (event: DomainEventMessage): Promise<void> => {
    if (event.additionalInformation?.reason !== 'RELEASED') return

    const nomisId = event.additionalInformation.nomsNumber
    const licence = _.head(
      await this.licenceService.getLicencesByNomisIdsAndStatus(
        [nomisId],
        [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
      )
    )

    if (!licence) return

    if (licence.licenceStatus !== LicenceStatus.APPROVED) {
      await this.licenceService.updateStatus(licence.licenceId.toString(), LicenceStatus.INACTIVE)
      return
    }

    // get offender record
    const offender = _.head(
      await this.prisonerService.searchPrisoners({
        prisonerIdentifier: licence.nomisId,
        prisonIds: [licence.prisonCode],
      } as PrisonerSearchCriteria)
    )

    if (!offender) {
      logger.error(`unable to find offender with nomsId ${licence.nomisId} for prison code ${licence.prisonCode}`)
      return
    }

    // check for HDC licence
    const hdcLicence = await this.prisonerService.getActiveHdcStatus(offender.bookingId)

    // mark Licence as inactive if an approved HDC licence already exists for the offender
    const newStatus =
      !!hdcLicence && hdcLicence.approvalStatus === LicenceStatus.APPROVED
        ? LicenceStatus.INACTIVE
        : LicenceStatus.ACTIVE
    await this.licenceService.updateStatus(licence.licenceId.toString(), newStatus)
  }
}
