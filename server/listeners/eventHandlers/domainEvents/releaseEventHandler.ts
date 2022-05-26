import LicenceService from '../../../services/licenceService'
import { DomainEventMessage } from '../../../@types/events'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'

export default class ReleaseEventHandler {
  constructor(private readonly licenceService: LicenceService, private readonly prisonerService: PrisonerService) {}

  handle = async (event: DomainEventMessage): Promise<void> => {
    if (event.additionalInformation?.reason !== 'RELEASED') return

    const nomisId = event.additionalInformation.nomsNumber
    const licence = await this.licenceService.getLatestLicenceByNomisIdsAndStatus(
      [nomisId],
      [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
    )

    if (!licence) return

    const licenceId = licence.licenceId.toString()

    // licence is not approved and the offender has been released, so can no longer be a valid licence
    // mark Licence as inactive if an approved HDC licence already exists for the offender
    const newStatus =
      licence.licenceStatus !== LicenceStatus.APPROVED || (await this.prisonerService.hdcLicenceIsApproved(licenceId))
        ? LicenceStatus.INACTIVE
        : LicenceStatus.ACTIVE

    await this.licenceService.updateStatus(licenceId, newStatus)
  }
}
