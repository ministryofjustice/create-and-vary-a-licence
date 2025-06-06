import { format, isAfter, startOfDay } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { parseCvlDate, parseIsoDate } from '../../../utils/utils'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import { PrisonEventMessage } from '../../../@types/events'
import { PrisonApiPrisoner } from '../../../@types/prisonApiClientTypes'

export default class DatesChangedEventHandler {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly prisonerService: PrisonerService,
  ) {}

  handle = async (event: PrisonEventMessage): Promise<void> => {
    const { bookingId, offenderIdDisplay } = event

    const nomisId =
      offenderIdDisplay ||
      (await this.prisonerService.searchPrisonersByBookingIds([bookingId])).map(o => o.prisonerNumber).pop()

    const activeLicence = await this.licenceService.getLatestLicenceByNomisIdsAndStatus(
      [nomisId],
      [LicenceStatus.ACTIVE],
    )

    const prisoner = await this.prisonerService.getPrisonerDetail(nomisId)

    if (activeLicence) {
      await this.deactivateLicencesIfPrisonerResentenced(activeLicence, bookingId)
      await this.deactivateLicencesIfFuturePrrd(activeLicence, prisoner)
    } else {
      const licences = await this.licenceService.getLicencesByNomisIdsAndStatus(
        [nomisId],
        [
          LicenceStatus.IN_PROGRESS,
          LicenceStatus.SUBMITTED,
          LicenceStatus.REJECTED,
          LicenceStatus.APPROVED,
          LicenceStatus.TIMED_OUT,
        ],
      )

      await Promise.all(licences.map(licence => this.licenceService.updateSentenceDates(licence.licenceId.toString())))
    }
  }

  deactivateLicencesIfPrisonerResentenced = async (licence: LicenceSummary, bookingId: number) => {
    const ssd = await this.prisonerService.getPrisonerLatestSentenceStartDate(bookingId)

    const lsd = licence.licenceStartDate ? parseCvlDate(licence.licenceStartDate) : null

    if (ssd && lsd && isAfter(ssd, lsd)) {
      await this.licenceService.deactivateActiveAndVariationLicences(licence.licenceId, 'RESENTENCED')
    }
  }

  deactivateLicencesIfFuturePrrd = async (licence: LicenceSummary, prisoner: PrisonApiPrisoner) => {
    const prrd =
      prisoner.sentenceDetail?.postRecallReleaseOverrideDate || prisoner.sentenceDetail?.postRecallReleaseDate
    if (prrd) {
      const prrdDate = parseIsoDate(prrd)
      if (format(prrdDate, 'dd/MM/yyyy') === licence.postRecallReleaseDate) {
        return
      }
      if (isAfter(prrdDate, startOfDay(new Date()))) {
        await this.licenceService.deactivateActiveAndVariationLicences(licence.licenceId, 'RECALLED')
      }
    }
  }
}
