import { format, isAfter, startOfDay } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { convertDateFormat, parseCvlDate, parseIsoDate } from '../../../utils/utils'
import logger from '../../../../logger'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import { PrisonEventMessage } from '../../../@types/events'
import { PrisonApiPrisoner } from '../../../@types/prisonApiClientTypes'

export default class DatesChangedEventHandler {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly prisonerService: PrisonerService
  ) {}

  handle = async (event: PrisonEventMessage): Promise<void> => {
    const { bookingId, offenderIdDisplay } = event

    const nomisId =
      offenderIdDisplay ||
      (await this.prisonerService.searchPrisonersByBookingIds([bookingId])).map(o => o.prisonerNumber).pop()

    const activeAndVariationLicences = await this.licenceService.getLicencesByNomisIdsAndStatus(
      [nomisId],
      [
        LicenceStatus.ACTIVE,
        LicenceStatus.VARIATION_IN_PROGRESS,
        LicenceStatus.VARIATION_SUBMITTED,
        LicenceStatus.VARIATION_REJECTED,
        LicenceStatus.VARIATION_APPROVED,
      ]
    )

    const prisoner = await this.prisonerService.getPrisonerDetail(nomisId)

    if (activeAndVariationLicences.length) {
      await this.deactivateLicencesIfPrisonerResentenced(activeAndVariationLicences, bookingId)
      await this.deactivateLicencesIfFuturePrrd(activeAndVariationLicences, prisoner)
    } else {
      const licences = await this.licenceService.getLicencesByNomisIdsAndStatus(
        [nomisId],
        [
          LicenceStatus.IN_PROGRESS,
          LicenceStatus.SUBMITTED,
          LicenceStatus.REJECTED,
          LicenceStatus.APPROVED,
          LicenceStatus.TIMED_OUT,
        ]
      )

      await Promise.all(
        licences.map(licence => {
          return this.updateLicenceSentenceDates(licence, prisoner)
        })
      )
    }
  }

  deactivateLicencesIfPrisonerResentenced = async (licences: LicenceSummary[], bookingId: number) => {
    const ssd = await this.prisonerService.getPrisonerLatestSentenceStartDate(bookingId)
    await Promise.all(
      licences.map(async licence => {
        const crd = licence.conditionalReleaseDate ? parseCvlDate(licence.conditionalReleaseDate) : null

        if (ssd && crd && isAfter(ssd, crd)) {
          logger.info(
            `new sentence start date: ${ssd} is after licence crd: ${crd} so deactivating current licence with id: ${licence.licenceId}`
          )
          await this.licenceService.updateStatus(licence.licenceId, LicenceStatus.INACTIVE)
        }
      })
    )
  }

  deactivateLicencesIfFuturePrrd = async (licences: LicenceSummary[], prisoner: PrisonApiPrisoner) => {
    const prrd =
      prisoner.sentenceDetail?.postRecallReleaseOverrideDate || prisoner.sentenceDetail?.postRecallReleaseDate
    const activeLicence =
      licences.length > 1 ? licences.find(l => l.licenceStatus === LicenceStatus.ACTIVE) : licences[0]
    if (prrd) {
      const prrdDate = parseIsoDate(prrd)
      if (format(prrdDate, 'dd/MM/yyyy') === activeLicence.postRecallReleaseDate) {
        return
      }
      if (isAfter(prrdDate, startOfDay(new Date()))) {
        licences.map(async licence => {
          logger.info(
            `licence id: ${activeLicence.licenceId} - deactivated due to new PRRD: ${prrd} (existing PRRD: ${activeLicence.postRecallReleaseDate})`
          )
          await this.licenceService.updateStatus(licence.licenceId, LicenceStatus.INACTIVE)
        })
      }
    }
  }

  updateLicenceSentenceDates = async (licence: LicenceSummary, prisoner: PrisonApiPrisoner) => {
    const sentenceStartDate = await this.prisonerService.getPrisonerLatestSentenceStartDate(prisoner.bookingId)

    await this.licenceService.updateSentenceDates(licence.licenceId.toString(), {
      conditionalReleaseDate:
        convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseOverrideDate) ||
        convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseDate),
      actualReleaseDate: convertDateFormat(prisoner.sentenceDetail?.confirmedReleaseDate),
      sentenceStartDate: format(sentenceStartDate, 'dd/MM/yyyy'),
      sentenceEndDate:
        convertDateFormat(prisoner.sentenceDetail?.sentenceExpiryOverrideDate) ||
        convertDateFormat(prisoner.sentenceDetail?.sentenceExpiryDate),
      licenceStartDate:
        convertDateFormat(prisoner.sentenceDetail?.confirmedReleaseDate) ||
        convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseOverrideDate) ||
        convertDateFormat(prisoner.sentenceDetail?.conditionalReleaseDate),
      licenceExpiryDate:
        convertDateFormat(prisoner.sentenceDetail?.licenceExpiryOverrideDate) ||
        convertDateFormat(prisoner.sentenceDetail?.licenceExpiryDate),
      topupSupervisionStartDate: convertDateFormat(prisoner.sentenceDetail?.topupSupervisionStartDate),
      topupSupervisionExpiryDate:
        convertDateFormat(prisoner.sentenceDetail?.topupSupervisionExpiryOverrideDate) ||
        convertDateFormat(prisoner.sentenceDetail?.topupSupervisionExpiryDate),
      postRecallReleaseDate:
        convertDateFormat(prisoner.sentenceDetail?.postRecallReleaseOverrideDate) ||
        convertDateFormat(prisoner.sentenceDetail?.postRecallReleaseDate),
    })
  }
}
