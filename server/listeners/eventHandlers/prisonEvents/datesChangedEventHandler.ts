import _ from 'lodash'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { PrisonEventMessage } from '../../../@types/prisonApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { convertDateFormat } from '../../../utils/utils'

export default class DatesChangedEventHandler {
  constructor(private readonly licenceService: LicenceService, private readonly prisonerService: PrisonerService) {}

  handle = async (event: PrisonEventMessage): Promise<void> => {
    const { bookingId, offenderIdDisplay } = event

    const nomisId =
      offenderIdDisplay ||
      (await this.prisonerService.searchPrisonersByBookingIds([bookingId])).map(o => o.prisonerNumber).pop()

    const licence = _.head(
      await this.licenceService.getLicencesByNomisIdsAndStatus(
        [nomisId],
        [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
      )
    )

    if (licence) {
      const prisoner = await this.prisonerService.getPrisonerDetail(nomisId)

      await this.licenceService.updateSentenceDates(licence.licenceId.toString(), {
        conditionalReleaseDate:
          convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseOverrideDate) ||
          convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseDate),
        actualReleaseDate: convertDateFormat(prisoner.sentenceDetail?.confirmedReleaseDate),
        sentenceStartDate: convertDateFormat(prisoner.sentenceDetail?.sentenceStartDate),
        sentenceEndDate: convertDateFormat(prisoner.sentenceDetail?.sentenceExpiryDate),
        licenceStartDate:
          convertDateFormat(prisoner.sentenceDetail?.confirmedReleaseDate) ||
          convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseOverrideDate) ||
          convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseDate),
        licenceExpiryDate: convertDateFormat(prisoner.sentenceDetail?.licenceExpiryDate),
        topupSupervisionStartDate: convertDateFormat(prisoner.sentenceDetail?.topupSupervisionStartDate),
        topupSupervisionExpiryDate: convertDateFormat(prisoner.sentenceDetail?.topupSupervisionExpiryDate),
      })
    }
  }
}
