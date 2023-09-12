import LicenceService from '../../../services/licenceService'
import { DomainEventMessage } from '../../../@types/events'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'

export default class ReleaseEventHandler {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly prisonerService: PrisonerService
  ) {}

  handle = async (event: DomainEventMessage): Promise<void> => {
    if (event.additionalInformation?.reason !== 'RELEASED') return

    const nomisId = event.additionalInformation.nomsNumber
    const licence = await this.licenceService.getLatestLicenceByNomisIdsAndStatus(
      [nomisId],
      [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
    )

    if (!licence) return

    /*
     * Set the licence to ACTIVE unless any of the following scenarios are true:
     * 1. Licence is not Approved and can no longer be made active now the offender has been released.
     * 2. The offender has an approved HDC licence, which takes priority over the standard licence, since
     *    HDC licences indicate an early release from the prison, ahead of the standard licence
     */
    const newStatus =
      licence.licenceStatus !== LicenceStatus.APPROVED ||
      (await this.prisonerService.hdcLicenceIsApproved(licence.bookingId?.toString()))
        ? LicenceStatus.INACTIVE
        : LicenceStatus.ACTIVE

    await this.licenceService.updateStatus(licence.licenceId, newStatus)
  }
}
