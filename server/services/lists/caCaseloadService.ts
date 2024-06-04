import moment from 'moment'
import { startOfDay, add, endOfDay } from 'date-fns'
import CommunityService from '../communityService'
import PrisonerService from '../prisonerService'
import LicenceService from '../licenceService'
import OmuCaselist from './omuCaselist'
import { DeliusRecord, ManagedCase } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { User } from '../../@types/CvlUserDetails'
import type { LicenceSummary, CaseloadItem } from '../../@types/licenceApiClientTypes'
import LicenceKind from '../../enumeration/LicenceKind'
import { parseCvlDate, parseIsoDate } from '../../utils/utils'
import config from '../../config'
import CaseListUtils from './caselistUtils'

export default class CaCaseloadService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService
  ) {}

  async getOmuCaseload(user: User, prisonCaseload: string[]): Promise<OmuCaselist> {
    // Get cases with a licence in ACTIVE, APPROVED, SUBMITTED, IN_PROGRESS or VARIATION_IN_* state
    const casesWithLicences = this.licenceService
      .getLicencesForOmu(user, prisonCaseload)
      .then(licences => this.mapLicencesToOffenders(licences))

    // Get cases due for release soon which do not have a submitted licence
    const today = startOfDay(new Date())
    const todayPlusFourWeeks = endOfDay(add(new Date(), { weeks: 4 }))
    const casesPendingLicence = this.licenceService
      .searchPrisonersByReleaseDate(today, todayPlusFourWeeks, prisonCaseload, user)
      .then(caseload => this.pairNomisRecordsWithDelius(caseload))
      .then(caseload => this.filterOffendersEligibleForLicence(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildCreateCaseload(caseload))
      .then(caseload => {
        return caseload
          .filter(c => !c.licences.find(l => l.status === LicenceStatus.TIMED_OUT && l.id))
          .filter(c =>
            [
              LicenceStatus.NOT_STARTED,
              LicenceStatus.TIMED_OUT,
              LicenceStatus.NOT_IN_PILOT,
              LicenceStatus.OOS_RECALL,
              LicenceStatus.OOS_BOTUS,
            ].some(status => c.licences.find(l => l.status === status))
          )
      })

    const [withLicence, pending] = await Promise.all([casesWithLicences, casesPendingLicence])
    const casesWithComs = await this.mapResponsibleComsToCases(withLicence.concat(pending))

    return new OmuCaselist(casesWithComs)
  }

  private pairNomisRecordsWithDelius = async (prisoners: Array<CaseloadItem>): Promise<Array<ManagedCase>> => {
    const caseloadNomisIds = prisoners
      .filter(({ prisoner }) => prisoner.prisonerNumber)
      .map(({ prisoner }) => prisoner.prisonerNumber)

    const deliusRecords = await this.communityService.getOffendersByNomsNumbers(caseloadNomisIds)

    return prisoners
      .map(({ prisoner: offender, cvl: cvlFields }) => {
        const deliusRecord = deliusRecords.find(d => d.otherIds.nomsNumber === offender.prisonerNumber)
        if (deliusRecord) {
          return {
            nomisRecord: offender,
            cvlFields,
            deliusRecord: {
              ...deliusRecord,
              staff: deliusRecord?.offenderManagers.find(om => om.active)?.staff,
            },
          }
        }
        return { nomisRecord: offender, cvlFields }
      })
      .filter(offender => offender.nomisRecord && offender.deliusRecord)
  }

  public mapOffendersToLicences = async (offenders: Array<ManagedCase>, user?: User): Promise<Array<ManagedCase>> => {
    const nomisIdList = offenders.map(offender => offender.nomisRecord.prisonerNumber).filter(id => id !== null)

    const existingLicences =
      nomisIdList.length === 0
        ? []
        : await this.licenceService.getLicencesByNomisIdsAndStatus(
            nomisIdList,
            [
              LicenceStatus.ACTIVE,
              LicenceStatus.IN_PROGRESS,
              LicenceStatus.SUBMITTED,
              LicenceStatus.APPROVED,
              LicenceStatus.VARIATION_IN_PROGRESS,
              LicenceStatus.VARIATION_SUBMITTED,
              LicenceStatus.VARIATION_APPROVED,
              LicenceStatus.VARIATION_REJECTED,
              LicenceStatus.TIMED_OUT,
            ],
            user
          )

    return offenders.map(offender => {
      const licences = existingLicences.filter(licence => licence.nomisId === offender.nomisRecord.prisonerNumber)
      if (licences.length > 0) {
        // Return a case in the list for the existing licence
        return {
          ...offender,
          licences: licences.map(licence => {
            const releaseDate = licence.actualReleaseDate || licence.conditionalReleaseDate
            return {
              id: licence.licenceId,
              status: licence.isReviewNeeded ? LicenceStatus.REVIEW_NEEDED : <LicenceStatus>licence.licenceStatus,
              type: <LicenceType>licence.licenceType,
              comUsername: licence.comUsername,
              kind: <LicenceKind>licence.kind,
              versionOf: licence.versionOf,
              hardStopDate: parseCvlDate(licence.hardStopDate),
              hardStopWarningDate: parseCvlDate(licence.hardStopWarningDate),
              isDueToBeReleasedInTheNextTwoWorkingDays: licence.isDueToBeReleasedInTheNextTwoWorkingDays,
              releaseDate: releaseDate ? parseCvlDate(releaseDate) : null,
            }
          }),
        }
      }

      // No licences present for this offender - determine how to show them in case lists

      // Determine the likely type of intended licence from the prison record
      const licenceType = LicenceService.getLicenceType(offender.nomisRecord)

      // Default status (if not overridden below) will show the case as clickable on case lists
      let licenceStatus = LicenceStatus.NOT_STARTED

      if (CaseListUtils.isBreachOfTopUpSupervision(offender)) {
        // Imprisonment status indicates a breach of top up supervision order - not clickable (yet)
        licenceStatus = LicenceStatus.OOS_BOTUS
      } else if (CaseListUtils.isRecall(offender)) {
        // Offender is subject to an active recall - not clickable
        licenceStatus = LicenceStatus.OOS_RECALL
      } else if (config.hardStopEnabled && offender.cvlFields.isInHardStopPeriod) {
        licenceStatus = LicenceStatus.TIMED_OUT
      }

      if (!offender.nomisRecord.conditionalReleaseDate) {
        return {
          ...offender,
          licences: [
            {
              status: licenceStatus,
              type: licenceType,
              hardStopDate: null,
              hardStopWarningDate: null,
              isDueToBeReleasedInTheNextTwoWorkingDays: null,
              releaseDate: null,
            },
          ],
        }
      }
      const hardStopDate = parseCvlDate(offender.cvlFields?.hardStopDate)
      const hardStopWarningDate = parseCvlDate(offender.cvlFields?.hardStopWarningDate)
      const isDueToBeReleasedInTheNextTwoWorkingDays = offender.cvlFields?.isDueToBeReleasedInTheNextTwoWorkingDays
      const releaseDate = offender.nomisRecord.confirmedReleaseDate || offender.nomisRecord.conditionalReleaseDate

      return {
        ...offender,
        licences: [
          {
            status: licenceStatus,
            type: licenceType,
            hardStopDate,
            hardStopWarningDate,
            isDueToBeReleasedInTheNextTwoWorkingDays,
            releaseDate: releaseDate ? parseIsoDate(releaseDate) : null,
          },
        ],
      }
    })
  }

  private filterOffendersEligibleForLicence = async (offenders: Array<ManagedCase>, user?: User) => {
    const eligibleOffenders = offenders
      .filter(offender => !CaseListUtils.isParoleEligible(offender.nomisRecord.paroleEligibilityDate))
      .filter(offender => offender.nomisRecord.legalStatus !== 'DEAD')
      .filter(offender => !offender.nomisRecord.indeterminateSentence)
      .filter(offender => offender.nomisRecord.conditionalReleaseDate)
      .filter(offender =>
        CaseListUtils.isEligibleEDS(
          offender.nomisRecord.paroleEligibilityDate,
          offender.nomisRecord.conditionalReleaseDate,
          offender.nomisRecord.confirmedReleaseDate,
          offender.nomisRecord.actualParoleDate
        )
      )

    if (!eligibleOffenders.length) return eligibleOffenders

    const hdcStatuses = await this.prisonerService.getHdcStatuses(
      eligibleOffenders.map(c => c.nomisRecord),
      user
    )

    return eligibleOffenders.filter(offender => {
      const hdcRecord = hdcStatuses.find(hdc => hdc.bookingId === offender.nomisRecord.bookingId)
      return (
        !hdcRecord ||
        hdcRecord.approvalStatus !== 'APPROVED' ||
        !offender.nomisRecord.homeDetentionCurfewEligibilityDate
      )
    })
  }

  private buildCreateCaseload = (managedOffenders: Array<ManagedCase>): Array<ManagedCase> => {
    return managedOffenders
      .filter(
        offender =>
          offender.nomisRecord.status &&
          (offender.nomisRecord.status.startsWith('ACTIVE') || offender.nomisRecord.status === 'INACTIVE TRN')
      )
      .filter(offender =>
        moment(
          moment(offender.nomisRecord.confirmedReleaseDate || offender.nomisRecord.conditionalReleaseDate, 'YYYY-MM-DD')
        ).isSameOrAfter(moment(), 'day')
      )
      .filter(offender =>
        [
          LicenceStatus.OOS_RECALL,
          LicenceStatus.OOS_BOTUS,
          LicenceStatus.NOT_IN_PILOT,
          LicenceStatus.NOT_STARTED,
          LicenceStatus.IN_PROGRESS,
          LicenceStatus.SUBMITTED,
          LicenceStatus.APPROVED,
          LicenceStatus.TIMED_OUT,
        ].some(status => offender.licences.find(l => l.status === status))
      )
  }

  private pairDeliusRecordsWithNomis = async (
    managedOffenders: Array<DeliusRecord>,
    user: User
  ): Promise<Array<ManagedCase>> => {
    const caseloadNomisIds = managedOffenders
      .filter(offender => offender.otherIds?.nomsNumber)
      .map(offender => offender.otherIds?.nomsNumber)

    const nomisRecords = await this.licenceService.searchPrisonersByNomsIds(caseloadNomisIds, user)

    return managedOffenders
      .map(offender => {
        const { prisoner, cvl: cvlFields } =
          nomisRecords.find(({ prisoner }) => prisoner.prisonerNumber === offender.otherIds?.nomsNumber) || {}
        return {
          deliusRecord: offender,
          nomisRecord: prisoner,
          cvlFields,
        }
      })
      .filter(offender => offender.nomisRecord)
  }

  private mapLicencesToOffenders = async (licences: LicenceSummary[], user?: User): Promise<Array<ManagedCase>> => {
    const nomisIds = licences.map(l => l.nomisId)
    const deliusRecords = await this.communityService.getOffendersByNomsNumbers(nomisIds)
    const offenders = await this.pairDeliusRecordsWithNomis(deliusRecords, user)
    return offenders.map(offender => {
      return {
        ...offender,
        licences: licences
          .filter(l => l.nomisId === offender.nomisRecord.prisonerNumber)
          .map(l => {
            const releaseDate = l.actualReleaseDate || l.conditionalReleaseDate
            return {
              id: l.licenceId,
              type: <LicenceType>l.licenceType,
              status: <LicenceStatus>l.licenceStatus,
              comUsername: l.comUsername,
              dateCreated: l.dateCreated,
              approvedBy: l.approvedByName,
              approvedDate: l.approvedDate,
              versionOf: l.versionOf,
              kind: <LicenceKind>l.kind,
              licenceStartDate: l.licenceStartDate,
              hardStopDate: parseCvlDate(l.hardStopDate),
              hardStopWarningDate: parseCvlDate(l.hardStopWarningDate),
              isDueToBeReleasedInTheNextTwoWorkingDays: l.isDueToBeReleasedInTheNextTwoWorkingDays,
              updatedByFullName: l.updatedByFullName,
              releaseDate: releaseDate ? parseCvlDate(releaseDate) : null,
            }
          }),
      }
    })
  }

  private async mapResponsibleComsToCases(caseload: Array<ManagedCase>): Promise<Array<ManagedCase>> {
    const comUsernames = caseload
      .map(
        offender =>
          offender.licences.find(l => offender.licences.length === 1 || l.status !== LicenceStatus.ACTIVE).comUsername
      )
      .filter(comUsername => comUsername)

    const coms = await this.communityService.getStaffDetailsByUsernameList(comUsernames)

    return caseload.map(offender => {
      const responsibleCom = coms.find(
        com =>
          com.username?.toLowerCase() ===
          offender.licences
            .find(l => offender.licences.length === 1 || l.status !== LicenceStatus.ACTIVE)
            .comUsername?.toLowerCase()
      )

      if (responsibleCom) {
        return {
          ...offender,
          probationPractitioner: {
            staffCode: responsibleCom.staffCode,
            name: `${responsibleCom.staff.forenames} ${responsibleCom.staff.surname}`.trim(),
          },
        }
      }

      if (!offender.deliusRecord.staff || offender.deliusRecord.staff.unallocated) {
        return {
          ...offender,
        }
      }

      return {
        ...offender,
        probationPractitioner: {
          staffCode: offender.deliusRecord.staff.code,
          name: `${offender.deliusRecord.staff.forenames} ${offender.deliusRecord.staff.surname}`.trim(),
        },
      }
    })
  }
}