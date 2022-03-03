import _ from 'lodash'

import LicenceService from '../../../services/licenceService'
import { DomainEventMessage } from '../../../@types/events'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'

export default class TransferredEventHandler {
  constructor(private readonly licenceService: LicenceService, private readonly prisonerService: PrisonerService) {}

  handle = async (event: DomainEventMessage): Promise<void> => {
    if (event.additionalInformation?.reason === 'TRANSFERRED') {
      const nomisId = event.additionalInformation.nomsNumber
      const licence = _.head(
        await this.licenceService.getLicencesByNomisIdsAndStatus(
          [nomisId],
          [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
        )
      )

      if (licence) {
        if (licence.licenceStatus === LicenceStatus.APPROVED) {
          await this.licenceService.updateStatus(licence.licenceId.toString(), LicenceStatus.SUBMITTED)
        }

        const prisonCode = event.additionalInformation.prisonId
        const prisonInformation = await this.prisonerService.getPrisonInformation(prisonCode)

        await this.licenceService.updatePrisonInformation(licence.licenceId.toString(), {
          prisonCode,
          prisonDescription: prisonInformation.formattedDescription || 'Not known',
          prisonTelephone: [
            prisonInformation.phones.find(phone => phone.type === 'BUS')?.ext,
            prisonInformation.phones.find(phone => phone.type === 'BUS')?.number,
          ]
            .filter(n => n)
            .join(' '),
        })
      }
    }
  }
}
