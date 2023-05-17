import _ from 'lodash'
import { isAfter, parse } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { PrisonApiPrisoner, PrisonEventMessage } from '../../../@types/prisonApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { convertDateFormat } from '../../../utils/utils'
import logger from '../../../../logger'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'

export default class DatesChangedEventHandler {
  constructor(private readonly licenceService: LicenceService, private readonly prisonerService: PrisonerService) {}

  handle = async (event: PrisonEventMessage): Promise<void> => {
    const { bookingId, offenderIdDisplay } = event

    const nomisId =
      offenderIdDisplay ||
      (await this.prisonerService.searchPrisonersByBookingIds([bookingId])).map(o => o.prisonerNumber).pop()
    const prisoner = await this.prisonerService.getPrisonerDetail(nomisId)

    const activeLicence = await this.licenceService.getLicencesByNomisIdsAndStatus(
      [nomisId],
      [
        LicenceStatus.ACTIVE,
        LicenceStatus.VARIATION_IN_PROGRESS,
        LicenceStatus.VARIATION_SUBMITTED,
        LicenceStatus.VARIATION_REJECTED,
        LicenceStatus.VARIATION_APPROVED,
      ]
    )

    if (activeLicence.length) {
      await this.deactivateLicenceIfPrisonerResentenced(activeLicence, prisoner)
    } else {
      const licence = _.head(
        await this.licenceService.getLicencesByNomisIdsAndStatus(
          [nomisId],
          [LicenceStatus.IN_PROGRESS, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED, LicenceStatus.APPROVED]
        )
      )

      if (licence) {
        await this.updateLicenceSentenceDates(licence, nomisId, prisoner)
      }
    }
  }

  deactivateLicenceIfPrisonerResentenced = async (licences: LicenceSummary[], prisoner: PrisonApiPrisoner) => {
    const ssd = prisoner.sentenceDetail?.sentenceStartDate
      ? parse(prisoner.sentenceDetail?.sentenceStartDate, 'yyyy-MM-dd', new Date())
      : null
    licences.forEach(async licence => {
      const crd = licence.conditionalReleaseDate
        ? parse(licence.conditionalReleaseDate, 'dd/MM/yyyy', new Date())
        : null

      if (ssd && crd && isAfter(ssd, crd)) {
        logger.info(
          `new sentence start date: ${ssd} is after licence crd: ${crd} so deactivating current licence with id: ${licence.licenceId}`
        )
        await this.licenceService.updateStatus(licence.licenceId.toString(), LicenceStatus.INACTIVE)
      }
    })
  }

  updateLicenceSentenceDates = async (licence: LicenceSummary, nomisId: string, prisoner: PrisonApiPrisoner) => {
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
