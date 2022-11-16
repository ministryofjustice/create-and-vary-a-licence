import _ from 'lodash'
import moment from 'moment'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { PrisonEventMessage } from '../../../@types/prisonApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { convertDateFormat } from '../../../utils/utils'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'

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

      // IS91 cases receive an update that wipes their CRD when their CRD passes.
      // We want to keep it in the service, so we should ignore any date-changing events that meet this criteria.
      if (['DET', 'RECEP_IMM'].includes(prisoner.imprisonmentStatus) && isPassedArdOrCrd(licence)) {
        return
      }

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

const isPassedArdOrCrd = (licence: LicenceSummary): boolean => {
  const releaseDate = licence.actualReleaseDate || licence.conditionalReleaseDate

  if (releaseDate) {
    return moment(releaseDate, 'YYYY-MM-DD').isSameOrBefore(moment())
  }

  return false
}
