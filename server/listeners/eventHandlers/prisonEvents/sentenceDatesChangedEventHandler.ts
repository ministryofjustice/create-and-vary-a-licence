import _ from 'lodash'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { PrisonEvent } from '../../../@types/prisonApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { convertDateFormat } from '../../../utils/utils'

export default class SentenceDatesChangedEventHandler {
  constructor(private readonly licenceService: LicenceService, private readonly prisonerService: PrisonerService) {}

  handle = async (event: PrisonEvent): Promise<void> => {
    const nomisId = event.offenderIdDisplay
    const licence = _.head(
      await this.licenceService.getLicencesByNomisIdsAndStatus(
        [nomisId],
        [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
      )
    )

    if (licence) {
      const prisoner = await this.prisonerService.getPrisonerDetail(nomisId)

      await Promise.all([
        await this.licenceService.updateStatus(licence.licenceId.toString(), LicenceStatus.IN_PROGRESS),
        await this.licenceService.updateSentenceDates(licence.licenceId.toString(), {
          conditionalReleaseDate:
            convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseOverrideDate) ||
            convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseDate),
          actualReleaseDate: convertDateFormat(prisoner.sentenceDetail?.releaseDate),
          sentenceStartDate: convertDateFormat(prisoner.sentenceDetail?.sentenceStartDate),
          sentenceEndDate: convertDateFormat(prisoner.sentenceDetail?.effectiveSentenceEndDate),
          licenceStartDate:
            convertDateFormat(prisoner.sentenceDetail?.releaseDate) ||
            convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseOverrideDate) ||
            convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseDate),
          licenceExpiryDate: convertDateFormat(prisoner.sentenceDetail?.licenceExpiryDate),
          topupSupervisionStartDate: convertDateFormat(prisoner.sentenceDetail?.topupSupervisionStartDate),
          topupSupervisionExpiryDate: convertDateFormat(prisoner.sentenceDetail?.topupSupervisionExpiryDate),
        }),
      ])
    }
  }
}
