import ProbationService from '../probationService'
import PrisonerService from '../prisonerService'
import LicenceService from '../licenceService'
import LicenceStatus from '../../enumeration/licenceStatus'
import type { CaseloadItem } from '../../@types/licenceApiClientTypes'

import CaseListUtils from './caselistUtils'
import config from '../../config'

export type PromptCase = Omit<Case, 'licenceStatuses'>

type Case = {
  prisonerNumber: string
  firstName: string
  lastName: string
  releaseDate: string
  licenceStatuses: string[]
} & DeliusRecord

type DeliusRecord = {
  crn: string
  comStaffCode: string
  comEmail: string
  comName: string
  comAllocationDate: string
  comProbationAreaCode: string
}

export default class PromptListService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly probationService: ProbationService,
    private readonly licenceService: LicenceService
  ) {}

  getListForDates = async (
    earliestReleaseDate: Date,
    latestReleaseDate: Date,
    licenceStatus: LicenceStatus[]
  ): Promise<PromptCase[]> => {
    const prisonCodes = config.rollout.prisons

    return this.licenceService
      .searchPrisonersByReleaseDate(earliestReleaseDate, latestReleaseDate, prisonCodes)
      .then(caseload => this.excludeIneligible(caseload))
      .then(caseload => this.enrichWithLicencesAndDeliusData(caseload))
      .then(prisoners =>
        prisoners
          .filter(offender => licenceStatus.some(status => offender.licenceStatuses.find(l => l === status)))
          .map(({ licenceStatuses, ...rest }) => rest)
      )
  }

  private enrichWithLicencesAndDeliusData = async (prisoners: Array<CaseloadItem>): Promise<Array<Case>> => {
    const caseloadNomisIds = prisoners
      .map(({ prisoner }) => prisoner.prisonerNumber)
      .filter(prisonerNumber => Boolean(prisonerNumber))

    const licenceStatuses = await this.getLicenceStatuses(caseloadNomisIds)
    const deliusRecords = await this.getDeliusRecords(caseloadNomisIds)

    return prisoners.flatMap(({ prisoner }) => {
      const deliusRecord = deliusRecords[prisoner.prisonerNumber]
      const licences = licenceStatuses[prisoner.prisonerNumber]
      if (deliusRecord) {
        return [
          {
            ...deliusRecord,
            prisonerNumber: prisoner.prisonerNumber,
            firstName: prisoner.firstName,
            lastName: prisoner.lastName,
            releaseDate: prisoner.confirmedReleaseDate || prisoner.conditionalReleaseDate,
            licenceStatuses: licences || [],
          },
        ]
      }
      return []
    })
  }

  private getLicenceStatuses = async (prisonerNumbers: Array<string>): Promise<Record<string, LicenceStatus[]>> => {
    const existingLicences =
      prisonerNumbers.length === 0
        ? []
        : await this.licenceService.getLicencesByNomisIdsAndStatus(prisonerNumbers, [
            LicenceStatus.ACTIVE,
            LicenceStatus.IN_PROGRESS,
            LicenceStatus.SUBMITTED,
            LicenceStatus.APPROVED,
            LicenceStatus.VARIATION_IN_PROGRESS,
            LicenceStatus.VARIATION_SUBMITTED,
            LicenceStatus.VARIATION_APPROVED,
            LicenceStatus.VARIATION_REJECTED,
          ])

    return Object.fromEntries(
      prisonerNumbers.map(prisonerNumber => {
        const licences = existingLicences.filter(licence => licence.nomisId === prisonerNumber)
        return [
          prisonerNumber,
          licences.length > 0
            ? licences.map(licence =>
                licence.isReviewNeeded ? LicenceStatus.REVIEW_NEEDED : <LicenceStatus>licence.licenceStatus
              )
            : [LicenceStatus.NOT_STARTED],
        ]
      })
    )
  }

  private getDeliusRecords = async (prisonerNumbers: Array<string>): Promise<Record<string, DeliusRecord>> => {
    const deliusRecords = await this.probationService.getOffendersByNomsNumbers(prisonerNumbers)
    const deliusCrns = deliusRecords.map(r => r.otherIds.crn)
    const comEmails = Object.fromEntries(
      (await this.probationService.getManagerEmailAddresses(deliusCrns)).map(r => [r.code, r.email])
    )

    return Object.fromEntries(
      deliusRecords.map(r => {
        const om = r.offenderManagers.find(om => om.active)
        return [
          r.otherIds.nomsNumber,
          {
            crn: r.otherIds.crn,
            comStaffCode: om.staff.code,
            comEmail: comEmails[om.staff.code],
            comName: `${om.staff.forenames} ${om.staff.surname}`,
            comAllocationDate: om.fromDate,
            comProbationAreaCode: om.probationArea.code,
          },
        ]
      })
    )
  }

  private async excludeIneligible(offenders: Array<CaseloadItem>) {
    const eligibleOffenders = offenders
      .filter(offender => offender.prisoner.conditionalReleaseDate)
      .filter(offender => !offender.cvl.isInHardStopPeriod)
      .filter(offender => offender.prisoner.legalStatus !== 'DEAD')
      .filter(offender => !offender.prisoner.indeterminateSentence)
      .filter(offender => !CaseListUtils.isBreachOfTopUpSupervision(offender.prisoner))
      .filter(offender => !CaseListUtils.isRecall(offender.prisoner))
      .filter(offender => !CaseListUtils.isParoleEligible(offender.prisoner.paroleEligibilityDate))
      .filter(offender =>
        CaseListUtils.isEligibleEDS(
          offender.prisoner.paroleEligibilityDate,
          offender.prisoner.conditionalReleaseDate,
          offender.prisoner.confirmedReleaseDate,
          offender.prisoner.actualParoleDate
        )
      )

    if (!eligibleOffenders.length) return eligibleOffenders

    const hdcStatuses = await this.prisonerService.getHdcStatuses(eligibleOffenders.map(c => c.prisoner))

    return eligibleOffenders.filter(offender => {
      const hdcRecord = hdcStatuses.find(hdc => hdc.bookingId === offender.prisoner.bookingId)
      return (
        !hdcRecord || hdcRecord.approvalStatus !== 'APPROVED' || !offender.prisoner.homeDetentionCurfewEligibilityDate
      )
    })
  }
}
