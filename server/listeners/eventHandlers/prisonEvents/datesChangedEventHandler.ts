import _ from 'lodash'
import { isAfter, parse } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { PrisonApiPrisoner, PrisonEventMessage } from '../../../@types/prisonApiClientTypes'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { convertDateFormat, isPassedArdOrCrd } from '../../../utils/utils'
import logger from '../../../../logger'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import LicenceOverrideService from '../../../services/licenceOverrideService'

export default class DatesChangedEventHandler {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly licenceOverrideService: LicenceOverrideService,
    private readonly prisonerService: PrisonerService
  ) {}

  handle = async (event: PrisonEventMessage): Promise<void> => {
    const { bookingId, offenderIdDisplay } = event

    const nomisId =
      offenderIdDisplay ||
      (await this.prisonerService.searchPrisonersByBookingIds([bookingId])).map(o => o.prisonerNumber).pop()
    const prisoner = await this.prisonerService.getPrisonerDetail(nomisId)

    const activeLicence = _.head(
      await this.licenceService.getLicencesByNomisIdsAndStatus([nomisId], [LicenceStatus.ACTIVE])
    )

    if (activeLicence) {
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

  deactivateLicenceIfPrisonerResentenced = async (licence: LicenceSummary, prisoner: PrisonApiPrisoner) => {
    const ssd = prisoner.sentenceDetail?.sentenceStartDate
      ? parse(prisoner.sentenceDetail?.sentenceStartDate, 'yyyy-MM-dd', new Date())
      : null
    const crd = licence.conditionalReleaseDate ? parse(licence.conditionalReleaseDate, 'dd/MM/yyyy', new Date()) : null

    if (ssd && crd && isAfter(ssd, crd)) {
      logger.info(
        `new sentence start date: ${ssd} is after licence crd: ${crd} so deactivating current licence with id: ${licence.licenceId}`
      )
      await this.licenceOverrideService.overrideStatusCode(
        licence.licenceId,
        LicenceStatus.INACTIVE,
        'Deactivating existing licence for a re-sentenced prisoner'
      )
    }
  }

  updateLicenceSentenceDates = async (licence: LicenceSummary, nomisId: string, prisoner: PrisonApiPrisoner) => {
    // IS91 cases receive an update that wipes their CRD when their CRD passes.
    // We want to keep it in the service, so we should ignore any date-changing events that meet this criteria.
    if (prisoner.legalStatus === 'IMMIGRATION_DETAINEE' && isPassedArdOrCrd(licence, prisoner)) {
      logger.info(
        `Ignoring date update event for NOMIS ID: ${nomisId}, CRN: ${licence.crn}, licence ID: ${licence.licenceId}`
      )
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
