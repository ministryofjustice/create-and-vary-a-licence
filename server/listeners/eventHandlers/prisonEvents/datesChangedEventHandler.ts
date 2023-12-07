import { format, isAfter, parse } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { convertDateFormat } from '../../../utils/utils'
import logger from '../../../../logger'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import { PrisonEventMessage } from '../../../@types/events'

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

    if (activeAndVariationLicences.length) {
      await this.deactivateLicencesIfPrisonerResentenced(activeAndVariationLicences, bookingId)
    } else {
      const licences = await this.licenceService.getLicencesByNomisIdsAndStatus(
        [nomisId],
        [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
      )

      await Promise.all(
        licences.map(licence => {
          return this.updateLicenceSentenceDates(licence, nomisId)
        })
      )
    }
  }

  deactivateLicencesIfPrisonerResentenced = async (licences: LicenceSummary[], bookingId: number) => {
    const ssd = await this.prisonerService.getPrisonerLatestSentenceStartDate(bookingId)
    await Promise.all(
      licences.map(async licence => {
        const crd = licence.conditionalReleaseDate
          ? parse(licence.conditionalReleaseDate, 'dd/MM/yyyy', new Date())
          : null

        if (ssd && crd && isAfter(ssd, crd)) {
          logger.info(
            `new sentence start date: ${ssd} is after licence crd: ${crd} so deactivating current licence with id: ${licence.licenceId}`
          )
          await this.licenceService.updateStatus(licence.licenceId, LicenceStatus.INACTIVE)
        }
      })
    )
  }

  updateLicenceSentenceDates = async (licence: LicenceSummary, nomisId: string) => {
    const prisoner = await this.prisonerService.getPrisonerDetail(nomisId)
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
    })
  }
}
