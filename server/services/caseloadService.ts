import moment from 'moment'
import { isFuture, parse, startOfDay, add, endOfDay } from 'date-fns'
import _ from 'lodash'
import CommunityService from './communityService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import OmuCaselist from './omuCaselist'
import { DeliusRecord, ManagedCase } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { User } from '../@types/CvlUserDetails'
import { CommunityApiManagedOffender } from '../@types/communityClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import { LicenceSummary } from '../@types/licenceApiClientTypes'
import Container from './container'
import type { OffenderDetail } from '../@types/probationSearchApiClientTypes'

export default class CaseloadService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService
  ) {}

  async getStaffCreateCaseload(user: User): Promise<ManagedCase[]> {
    const { deliusStaffIdentifier } = user

    return this.communityService
      .getManagedOffenders(deliusStaffIdentifier)
      .then(caseload => this.mapManagedOffenderRecordToOffenderDetail(caseload))
      .then(caseload => this.pairDeliusRecordsWithNomis(caseload, user))
      .then(caseload => this.filterOffendersEligibleForLicence(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildCreateCaseload(caseload))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  async getTeamCreateCaseload(user: User, teamSelected?: string[]): Promise<ManagedCase[]> {
    const teamCode = _.head(teamSelected || user.probationTeamCodes)

    return this.communityService
      .getManagedOffendersByTeam(teamCode)
      .then(caseload => this.mapManagedOffenderRecordToOffenderDetail(caseload))
      .then(caseload => this.pairDeliusRecordsWithNomis(caseload, user))
      .then(caseload => this.filterOffendersEligibleForLicence(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildCreateCaseload(caseload))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  async getStaffVaryCaseload(user: User): Promise<ManagedCase[]> {
    const { deliusStaffIdentifier } = user
    return this.communityService
      .getManagedOffenders(deliusStaffIdentifier)
      .then(caseload => this.mapManagedOffenderRecordToOffenderDetail(caseload))
      .then(caseload => this.pairDeliusRecordsWithNomis(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildVaryCaseload(caseload))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  async getTeamVaryCaseload(user: User, teamSelected?: string[]): Promise<ManagedCase[]> {
    const teamCode = _.head(teamSelected || user.probationTeamCodes)

    return this.communityService
      .getManagedOffendersByTeam(teamCode)
      .then(caseload => this.mapManagedOffenderRecordToOffenderDetail(caseload))
      .then(caseload => this.pairDeliusRecordsWithNomis(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildVaryCaseload(caseload))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  async getOmuCaseload(user: User, prisonCaseload: string[]): Promise<OmuCaselist> {
    // Get cases with a licence in ACTIVE, APPROVED, SUBMITTED, IN_PROGRESS or VARIATION_IN_* state
    const casesWithLicences = this.licenceService
      .getLicencesForOmu(user, prisonCaseload)
      .then(licences => this.mapLicencesToOffenders(licences))

    // Get cases due for release soon which do not have a submitted licence
    const today = startOfDay(new Date())
    const todayPlusFourWeeks = endOfDay(add(new Date(), { weeks: 4 }))
    const casesPendingLicence = this.prisonerService
      .searchPrisonersByReleaseDate(today, todayPlusFourWeeks, prisonCaseload, user)
      .then(caseload => this.wrap(caseload))
      .then(caseload => this.pairNomisRecordsWithDelius(caseload))
      .then(caseload => this.filterOffendersEligibleForLicence(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildCreateCaseload(caseload))
      .then(caseload => {
        return caseload.filter(
          c =>
            [
              LicenceStatus.NOT_STARTED,
              LicenceStatus.NOT_IN_PILOT,
              LicenceStatus.OOS_RECALL,
              LicenceStatus.OOS_BOTUS,
            ].some(status => c.licences.find(l => l.status === status)),
          'Has no licence in NOT_STARTED, NOT_IN_PILOT, OOS_RECALL, OOS_BOTUS'
        )
      })

    const [withLicence, pending] = await Promise.all([casesWithLicences, casesPendingLicence])
    const casesWithComs = await this.mapResponsibleComsToCasesWithExclusions(withLicence.concat(pending))

    return new OmuCaselist(casesWithComs)
  }

  async getApproverCaseload(user: User, prisonCaseload: string[]): Promise<ManagedCase[]> {
    return this.licenceService
      .getLicencesForApproval(user, prisonCaseload)
      .then(licences => this.mapLicencesToOffenders(licences))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  async getVaryApproverCaseload(user: User): Promise<ManagedCase[]> {
    return this.licenceService
      .getLicencesForVariationApproval(user)
      .then(licences => this.mapLicencesToOffenders(licences))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  async getVaryApproverCaseloadByRegion(user: User): Promise<ManagedCase[]> {
    return this.licenceService
      .getLicencesForVariationApprovalByRegion(user)
      .then(licences => this.mapLicencesToOffenders(licences))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  public pairNomisRecordsWithDelius = async (prisoners: Container<Prisoner>): Promise<Container<ManagedCase>> => {
    const caseloadNomisIds = prisoners
      .unwrap()
      .filter(offender => offender.prisonerNumber)
      .map(offender => offender.prisonerNumber)

    const deliusRecords = await this.communityService.getOffendersByNomsNumbers(caseloadNomisIds)

    return prisoners
      .map(offender => {
        const deliusRecord = deliusRecords.find(d => d.otherIds.nomsNumber === offender.prisonerNumber)
        if (deliusRecord) {
          return {
            nomisRecord: offender,
            deliusRecord: {
              ...deliusRecord,
              staff: deliusRecord?.offenderManagers.find(om => om.active)?.staff,
            },
          }
        }
        return { nomisRecord: offender }
      })
      .filter(offender => offender.nomisRecord && offender.deliusRecord, 'Unable to find delius record')
  }

  public mapOffendersToLicences = async (
    offenders: Container<ManagedCase>,
    user?: User
  ): Promise<Container<ManagedCase>> => {
    const nomisIdList = offenders
      .map(offender => offender.nomisRecord.prisonerNumber)
      .unwrap()
      .filter(id => id !== null)

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
            return {
              id: licence.licenceId,
              status: <LicenceStatus>licence.licenceStatus,
              type: <LicenceType>licence.licenceType,
              comUsername: licence.comUsername,
            }
          }),
        }
      }

      // No licences present for this offender - determine how to show them in case lists

      // Determine the likely type of intended licence from the prison record
      const licenceType = this.getLicenceType(offender.nomisRecord)

      // Default status (if not overridden below) will show the case as clickable on case lists
      let licenceStatus = LicenceStatus.NOT_STARTED

      if (this.isBreachOfTopUpSupervision(offender)) {
        // Imprisonment status indicates a breach of top up supervision order - not clickable (yet)
        licenceStatus = LicenceStatus.OOS_BOTUS
      } else if (this.isRecall(offender)) {
        // Offender is subject to an active recall - not clickable
        licenceStatus = LicenceStatus.OOS_RECALL
      }

      return { ...offender, licences: [{ status: licenceStatus, type: licenceType }] }
    })
  }

  public filterOffendersEligibleForLicence = async (offenders: Container<ManagedCase>, user?: User) => {
    const eligibleOffenders = offenders
      .filter(
        offender => !CaseloadService.isParoleEligible(offender.nomisRecord.paroleEligibilityDate),
        'is eligible for parole'
      )
      .filter(offender => offender.nomisRecord.legalStatus !== 'DEAD', 'is dead')
      .filter(offender => !offender.nomisRecord.indeterminateSentence, 'on indeterminate sentence')
      .filter(offender => offender.nomisRecord.conditionalReleaseDate, 'has no conditional release date')

    if (eligibleOffenders.isEmpty()) return eligibleOffenders

    const hdcStatuses = await this.prisonerService.getHdcStatuses(
      eligibleOffenders.map(c => c.nomisRecord).unwrap(),
      user
    )

    return eligibleOffenders.filter(offender => {
      const hdcRecord = hdcStatuses.find(hdc => hdc.bookingId === offender.nomisRecord.bookingId)
      return !hdcRecord || hdcRecord.approvalStatus !== 'APPROVED'
    }, 'approved for HDC')
  }

  private buildCreateCaseload = (managedOffenders: Container<ManagedCase>): Container<ManagedCase> => {
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
          ].some(status => offender.licences.find(l => l.status === status)),
        'licence status is not one of OOS_RECALL, OOS_BOTUS, NOT_IN_PILOT, NOT_STARTED, IN_PROGRESS, SUBMITTED, APPROVED,'
      )
  }

  private buildVaryCaseload = (managedOffenders: Container<ManagedCase>): Container<ManagedCase> => {
    return managedOffenders.filter(
      offender =>
        [
          LicenceStatus.ACTIVE,
          LicenceStatus.VARIATION_IN_PROGRESS,
          LicenceStatus.VARIATION_SUBMITTED,
          LicenceStatus.VARIATION_APPROVED,
          LicenceStatus.VARIATION_REJECTED,
        ].some(status => offender.licences.find(l => l.status === status)),
      'licence status is not one of ACTIVE, VARIATION_IN_PROGRESS, VARIATION_SUBMITTED, VARIATION_APPROVED, VARIATION_REJECTED'
    )
  }

  private pairDeliusRecordsWithNomis = async (
    managedOffenders: Container<DeliusRecord>,
    user: User
  ): Promise<Container<ManagedCase>> => {
    const caseloadNomisIds = managedOffenders
      .unwrap()
      .filter(offender => offender.otherIds?.nomsNumber)
      .map(offender => offender.otherIds?.nomsNumber)

    const nomisRecords = await this.prisonerService.searchPrisonersByNomisIds(caseloadNomisIds, user)

    return managedOffenders
      .map(offender => {
        return {
          deliusRecord: offender,
          nomisRecord: nomisRecords.find(nomisRecord => nomisRecord.prisonerNumber === offender.otherIds?.nomsNumber),
        }
      })
      .filter(offender => offender.nomisRecord, 'unable to find prison record')
  }

  private mapLicencesToOffenders = async (licences: LicenceSummary[], user?: User): Promise<Container<ManagedCase>> => {
    const nomisIds = licences.map(l => l.nomisId)
    const deliusRecords = await this.communityService.getOffendersByNomsNumbers(nomisIds)
    const offenders = await this.pairDeliusRecordsWithNomis(this.wrap(deliusRecords), user)
    return offenders.map(offender => {
      return {
        ...offender,
        licences: licences
          .filter(l => l.nomisId === offender.nomisRecord.prisonerNumber)
          .map(l => {
            return {
              id: l.licenceId,
              type: <LicenceType>l.licenceType,
              status: <LicenceStatus>l.licenceStatus,
              comUsername: l.comUsername,
              dateCreated: l.dateCreated,
            }
          }),
      }
    })
  }

  private async mapResponsibleComsToCasesWithExclusions(
    caseload: Container<ManagedCase>
  ): Promise<Container<ManagedCase>> {
    const comUsernames = caseload
      .unwrap()
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

  private async mapResponsibleComsToCases(caseload: Container<ManagedCase>): Promise<ManagedCase[]> {
    return this.mapResponsibleComsToCasesWithExclusions(caseload).then(it => it.unwrap())
  }

  private getLicenceType = (nomisRecord: Prisoner): LicenceType => {
    const tused = nomisRecord.topupSupervisionExpiryDate
    const led = nomisRecord.licenceExpiryDate

    if (!led) {
      return LicenceType.PSS
    }

    if (!tused || moment(tused, 'YYYY-MM-DD') <= moment(led, 'YYYY-MM-DD')) {
      return LicenceType.AP
    }

    return LicenceType.AP_PSS
  }

  private mapManagedOffenderRecordToOffenderDetail = async (
    caseload: CommunityApiManagedOffender[]
  ): Promise<Container<DeliusRecord>> => {
    const crns = caseload.map(c => c.offenderCrn)
    const batchedCrns = _.chunk(crns, 500)
    const batchedOffenders: Promise<OffenderDetail[]>[] = batchedCrns.map(batch => {
      return this.communityService.getOffendersByCrn(batch)
    })
    const offenders = (await Promise.all(batchedOffenders)).flat()
    return this.wrap(
      offenders.map(o => {
        return {
          ...o,
          ...caseload.find(c => c.offenderCrn === o.otherIds?.crn),
        }
      })
    )
  }

  private isRecall = (offender: ManagedCase): boolean => {
    const recall = offender.nomisRecord?.recall && offender.nomisRecord.recall === true
    const crd = offender.nomisRecord?.conditionalReleaseDate
    const prrd = offender.nomisRecord?.postRecallReleaseDate

    // If a CRD but no PRRD it should NOT be treated as a recall
    if (crd && !prrd) {
      return false
    }

    if (crd && prrd) {
      const dateCrd = moment(offender.nomisRecord.conditionalReleaseDate, 'YYYY-MM-DD')
      const datePrrd = moment(offender.nomisRecord.postRecallReleaseDate, 'YYYY-MM-DD')
      // If the PRRD > CRD - it should be treated as a recall
      if (datePrrd.isAfter(dateCrd)) {
        return true
      }
      // If PRRD <= CRD - should not be treated as a recall
      return false
    }

    // Trust the Nomis recall flag as a fallback position - the above rules should always override
    return recall
  }

  private isBreachOfTopUpSupervision = (offender: ManagedCase): boolean => {
    return offender.nomisRecord?.imprisonmentStatus && offender.nomisRecord?.imprisonmentStatus === 'BOTUS'
  }

  /**
   * Parole Eligibility Date must be set and in the future
   * If the date is in the past, it's no longer valid
   * @param ped
   */
  public static isParoleEligible(ped: string): boolean {
    if (!ped) return false
    const pedDate = parse(ped, 'yyyy-MM-dd', new Date())
    return isFuture(pedDate)
  }

  wrap<T>(items: T[]): Container<T> {
    return new Container(items)
  }
}
