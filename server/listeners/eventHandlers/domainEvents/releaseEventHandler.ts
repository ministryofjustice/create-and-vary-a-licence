import _ from 'lodash'
import LicenceService from '../../../services/licenceService'
import { DomainEventMessage } from '../../../@types/events'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'

export default class ReleaseEventHandler {
  constructor(private readonly licenceService: LicenceService, private readonly prisonerService: PrisonerService) {}

  handle = async (event: DomainEventMessage): Promise<void> => {
    if (event.additionalInformation?.reason !== 'RELEASED') return

    const nomisId = event.additionalInformation.nomsNumber
    const licences = await this.licenceService.getLicencesByNomisIdsAndStatus(
      [nomisId],
      [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
    )

    if (!licences?.length) {
      return
    }

    const approvedLicences = licences.filter(licence => licence.licenceStatus === LicenceStatus.APPROVED)
    const unapprovedLicences = licences.filter(licence => licence.licenceStatus !== LicenceStatus.APPROVED)

    if (approvedLicences.length > 1) {
      throw new Error('Multiple approved licences found, unable to automatically activate')
    }

    /*
     * Set the licence to ACTIVE unless any of the following scenarios are true:
     * 1. Licence is not Approved and can no longer be made active now the offender has been released.
     * 2. The offender has an approved HDC licence, which takes priority over the standard licence, since
     *    HDC licences indicate an early release from the prison, ahead of the standard licence
     */
    if (approvedLicences.length) {
      const licenceToActivate = _.head(approvedLicences)
      const newStatus = (await this.prisonerService.hdcLicenceIsApproved(licenceToActivate.bookingId?.toString()))
        ? LicenceStatus.INACTIVE
        : LicenceStatus.ACTIVE

      await this.licenceService.updateStatus(licenceToActivate.licenceId, newStatus)
    }

    if (unapprovedLicences.length) {
      await this.licenceService.deactivateLicences(unapprovedLicences)
    }
  }
}
