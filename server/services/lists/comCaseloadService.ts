import _ from 'lodash'
import moment from 'moment/moment'
import { format } from 'date-fns'
import { User } from '../../@types/CvlUserDetails'
import {
  DeliusRecord,
  Licence,
  LicenceCreationType,
  ManagedCase,
  ProbationPractitioner,
} from '../../@types/managedCase'
import CommunityService from '../communityService'
import type { CommunityApiManagedOffender } from '../../@types/communityClientTypes'
import type { OffenderDetail } from '../../@types/probationSearchApiClientTypes'
import LicenceService from '../licenceService'
import CaseListUtils from './caselistUtils'
import PrisonerService from '../prisonerService'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import LicenceKind from '../../enumeration/LicenceKind'
import { convertToTitleCase, parseCvlDate, parseIsoDate } from '../../utils/utils'
import type { ComReviewCount } from '../../@types/licenceApiClientTypes'

export type ComCase = {
  name: string
  crnNumber: string
  prisonerNumber: string
  releaseDate: string
  sortDate?: Date
  licenceId: number
  licenceStatus: LicenceStatus
  licenceType: 'AP' | 'AP_PSS' | 'PSS'
  probationPractitioner: ProbationPractitioner
  hardStopDate?: string
  hardStopWarningDate?: string
  kind: LicenceKind
  isDueForEarlyRelease: boolean
  licenceCreationType?: LicenceCreationType
}

export default class ComCaseloadService {
  constructor(
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService,
    private readonly prisonerService: PrisonerService
  ) {}

  public async getStaffCreateCaseload(user: User): Promise<ComCase[]> {
    const { deliusStaffIdentifier } = user

    return this.communityService
      .getManagedOffenders(deliusStaffIdentifier)
      .then(caseload => this.mapManagedOffenderRecordToOffenderDetail(caseload))
      .then(caseload => this.pairDeliusRecordsWithNomis(caseload, user))
      .then(caseload => this.filterOffendersEligibleForLicence(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildCreateCaseload(caseload))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
      .then(caseload => this.createCaseloadViewModel(caseload))
  }

  public async getTeamCreateCaseload(user: User, teamSelected?: string[]): Promise<ComCase[]> {
    const teamCode = _.head(teamSelected || user.probationTeamCodes)

    return this.communityService
      .getManagedOffendersByTeam(teamCode)
      .then(caseload => this.mapManagedOffenderRecordToOffenderDetail(caseload))
      .then(caseload => this.pairDeliusRecordsWithNomis(caseload, user))
      .then(caseload => this.filterOffendersEligibleForLicence(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildCreateCaseload(caseload))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
      .then(caseload => this.createCaseloadViewModel(caseload))
  }

  async getStaffVaryCaseload(user: User): Promise<ComCase[]> {
    const { deliusStaffIdentifier } = user
    return this.communityService
      .getManagedOffenders(deliusStaffIdentifier)
      .then(caseload => this.mapManagedOffenderRecordToOffenderDetail(caseload))
      .then(caseload => this.pairDeliusRecordsWithNomis(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildVaryCaseload(caseload))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
      .then(caseload => this.createVaryCaseloadViewModel(caseload))
  }

  async getTeamVaryCaseload(user: User, teamSelected?: string[]): Promise<ComCase[]> {
    const teamCode = _.head(teamSelected || user.probationTeamCodes)

    return this.communityService
      .getManagedOffendersByTeam(teamCode)
      .then(caseload => this.mapManagedOffenderRecordToOffenderDetail(caseload))
      .then(caseload => this.pairDeliusRecordsWithNomis(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildVaryCaseload(caseload))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
      .then(caseload => this.createVaryCaseloadViewModel(caseload))
  }

  async getComReviewCount(user: User): Promise<ComReviewCount> {
    return this.licenceService.getComReviewCount(user)
  }

  private mapManagedOffenderRecordToOffenderDetail = async (
    caseload: CommunityApiManagedOffender[]
  ): Promise<Array<DeliusRecord>> => {
    const crns = caseload.map(c => c.offenderCrn)
    const batchedCrns = _.chunk(crns, 500)
    const batchedOffenders: Promise<OffenderDetail[]>[] = batchedCrns.map(batch => {
      return this.communityService.getOffendersByCrn(batch)
    })
    const offenders = (await Promise.all(batchedOffenders)).flat()
    return offenders.map(o => {
      return {
        ...o,
        ...caseload.find(c => c.offenderCrn === o.otherIds?.crn),
      }
    })
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
      .filter(offender => offender.nomisRecord, 'unable to find prison record')
  }

  private filterOffendersEligibleForLicence = async (offenders: Array<ManagedCase>, user?: User) => {
    const eligibleOffenders = offenders
      .filter(
        offender => !CaseListUtils.isParoleEligible(offender.nomisRecord.paroleEligibilityDate),
        'is eligible for parole'
      )
      .filter(offender => offender.nomisRecord.legalStatus !== 'DEAD', 'is dead')
      .filter(offender => !offender.nomisRecord.indeterminateSentence, 'on indeterminate sentence')
      .filter(offender => offender.nomisRecord.conditionalReleaseDate, 'has no conditional release date')
      .filter(
        offender =>
          CaseListUtils.isEligibleEDS(
            offender.nomisRecord.paroleEligibilityDate,
            offender.nomisRecord.conditionalReleaseDate,
            offender.nomisRecord.confirmedReleaseDate,
            offender.nomisRecord.actualParoleDate
          ),
        'is on an ineligible Extended Determinate Sentence'
      )

    if (eligibleOffenders.length === 0) return eligibleOffenders

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
    }, 'approved for HDC')
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
      const licenceType = CaseListUtils.getLicenceType(offender.nomisRecord)

      // Default status (if not overridden below) will show the case as clickable on case lists
      let licenceStatus = LicenceStatus.NOT_STARTED

      if (CaseListUtils.isBreachOfTopUpSupervision(offender.nomisRecord)) {
        // Imprisonment status indicates a breach of top up supervision order - not clickable (yet)
        licenceStatus = LicenceStatus.OOS_BOTUS
      } else if (CaseListUtils.isRecall(offender.nomisRecord)) {
        // Offender is subject to an active recall - not clickable
        licenceStatus = LicenceStatus.OOS_RECALL
      } else if (offender.cvlFields.isInHardStopPeriod) {
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

  private buildCreateCaseload = (managedOffenders: Array<ManagedCase>): Array<ManagedCase> => {
    return managedOffenders
      .filter(
        offender =>
          offender.nomisRecord.status &&
          (offender.nomisRecord.status.startsWith('ACTIVE') || offender.nomisRecord.status === 'INACTIVE TRN'),
        'status is not ACTIVE or INACTIVE TRN'
      )
      .filter(
        offender =>
          moment(
            moment(
              offender.nomisRecord.confirmedReleaseDate || offender.nomisRecord.conditionalReleaseDate,
              'YYYY-MM-DD'
            )
          ).isSameOrAfter(moment(), 'day'),
        'confirmed release date (or conditional release date) is before today'
      )
      .filter(
        offender =>
          [
            LicenceStatus.OOS_RECALL,
            LicenceStatus.OOS_BOTUS,
            LicenceStatus.NOT_IN_PILOT,
            LicenceStatus.NOT_STARTED,
            LicenceStatus.IN_PROGRESS,
            LicenceStatus.SUBMITTED,
            LicenceStatus.APPROVED,
            LicenceStatus.TIMED_OUT,
          ].some(status => offender.licences.find(l => l.status === status)),
        'licence status is not one of OOS_RECALL, OOS_BOTUS, NOT_IN_PILOT, NOT_STARTED, IN_PROGRESS, SUBMITTED, APPROVED,'
      )
  }

  private async mapResponsibleComsToCasesWithExclusions(caseload: Array<ManagedCase>): Promise<Array<ManagedCase>> {
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

  private async mapResponsibleComsToCases(caseload: Array<ManagedCase>): Promise<ManagedCase[]> {
    return this.mapResponsibleComsToCasesWithExclusions(caseload).then(it => it)
  }

  private buildVaryCaseload = (managedOffenders: Array<ManagedCase>): Array<ManagedCase> => {
    return managedOffenders.filter(
      offender =>
        [
          LicenceStatus.ACTIVE,
          LicenceStatus.VARIATION_IN_PROGRESS,
          LicenceStatus.VARIATION_SUBMITTED,
          LicenceStatus.VARIATION_APPROVED,
          LicenceStatus.VARIATION_REJECTED,
          LicenceStatus.REVIEW_NEEDED,
        ].some(status => offender.licences.find(l => l.status === status)),
      'licence status is not one of ACTIVE, VARIATION_IN_PROGRESS, VARIATION_SUBMITTED, VARIATION_APPROVED, VARIATION_REJECTED, REVIEW_NEEDED'
    )
  }

  createCaseloadViewModel = (caseload: ManagedCase[]): ComCase[] => {
    return caseload
      .map(c => {
        const licence = this.findLicenceToDisplay(c)
        const releaseDate = c.nomisRecord.releaseDate || c.nomisRecord.conditionalReleaseDate
        const sortDate = releaseDate && parseIsoDate(releaseDate)
        const { hardStopDate, hardStopWarningDate } = licence
        return {
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          crnNumber: c.deliusRecord.offenderCrn,
          prisonerNumber: c.nomisRecord.prisonerNumber,
          releaseDate: releaseDate && format(releaseDate, 'dd/MM/yyyy'),
          sortDate,
          licenceId: licence.id,
          licenceStatus: licence.status,
          licenceType: licence.type,
          probationPractitioner: c.probationPractitioner,
          hardStopDate: hardStopDate && format(hardStopDate, 'dd/MM/yyyy'),
          hardStopWarningDate: hardStopWarningDate && format(hardStopWarningDate, 'dd/MM/yyyy'),
          kind: licence.kind,
          isDueForEarlyRelease: c.cvlFields?.isDueForEarlyRelease,
          licenceCreationType: licence.licenceCreationType,
        }
      })
      .sort((a, b) => {
        return (a.sortDate?.getTime() || 0) - (b.sortDate?.getTime() || 0)
      })
  }

  createVaryCaseloadViewModel = (caseload: ManagedCase[]): ComCase[] => {
    return caseload.map(managedCase => {
      const licences = managedCase.licences.filter(l => l.status !== LicenceStatus.TIMED_OUT)
      const licence =
        licences.length > 1
          ? licences.find(l => l.status !== LicenceStatus.ACTIVE && l.status !== LicenceStatus.REVIEW_NEEDED)
          : _.head(licences)

      const releaseDate = managedCase.nomisRecord.releaseDate || managedCase.nomisRecord.conditionalReleaseDate
      return {
        licenceId: licence.id,
        name: convertToTitleCase(`${managedCase.nomisRecord.firstName} ${managedCase.nomisRecord.lastName}`.trim()),
        crnNumber: managedCase.deliusRecord.offenderCrn,
        prisonerNumber: managedCase.nomisRecord.prisonerNumber,
        licenceType: licence.type,
        releaseDate: releaseDate && format(releaseDate, 'dd/MM/yyyy'),
        licenceStatus: licence.status,
        probationPractitioner: managedCase.probationPractitioner,
        kind: licence.kind,
        isDueForEarlyRelease: managedCase.cvlFields?.isDueForEarlyRelease,
      }
    })
  }

  findLicenceToDisplay = (c: ManagedCase): Licence => {
    const timedOutLicence = c.licences.find(l => l.status === LicenceStatus.TIMED_OUT)
    const hardStopLicence = c.licences.find(l => l.kind === LicenceKind.HARD_STOP)

    if (timedOutLicence && timedOutLicence.versionOf) {
      const previouslyApproved = c.licences.find(l => l.id === timedOutLicence.versionOf)
      return {
        ...previouslyApproved,
        status: LicenceStatus.TIMED_OUT,
        licenceCreationType: LicenceCreationType.LICENCE_CHANGES_NOT_APPROVED_IN_TIME,
      }
    }

    if (
      (timedOutLicence && !hardStopLicence) ||
      (hardStopLicence && hardStopLicence.status === LicenceStatus.IN_PROGRESS)
    ) {
      if (timedOutLicence) {
        return { ...timedOutLicence, licenceCreationType: LicenceCreationType.PRISON_WILL_CREATE_THIS_LICENCE }
      }

      return {
        ...hardStopLicence,
        status: LicenceStatus.TIMED_OUT,
        licenceCreationType: LicenceCreationType.PRISON_WILL_CREATE_THIS_LICENCE,
      }
    }
    if (hardStopLicence) {
      return {
        ...hardStopLicence,
        status: LicenceStatus.TIMED_OUT,
        licenceCreationType: LicenceCreationType.LICENCE_CREATED_BY_PRISON,
      }
    }

    const licence =
      c.licences.length > 1 ? c.licences.find(l => l.status !== LicenceStatus.APPROVED) : _.head(c.licences)

    if (!licence.id) {
      return { ...licence, licenceCreationType: LicenceCreationType.LICENCE_NOT_STARTED }
    }

    return { ...licence, licenceCreationType: LicenceCreationType.LICENCE_IN_PROGRESS }
  }
}
