import moment from 'moment'
import CommunityService from './communityService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import { DeliusRecord, ManagedCase } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { User } from '../@types/CvlUserDetails'
import { prisonInRollout, probationAreaInRollout } from '../utils/rolloutUtils'
import { CommunityApiManagedOffender } from '../@types/communityClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import { LicenceSummary } from '../@types/licenceApiClientTypes'

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

  async getTeamCreateCaseload(user: User): Promise<ManagedCase[]> {
    const { probationTeamCodes } = user

    return Promise.all(probationTeamCodes.map(teamCode => this.communityService.getManagedOffendersByTeam(teamCode)))
      .then(caseload => caseload.flat())
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

  async getTeamVaryCaseload(user: User): Promise<ManagedCase[]> {
    const { probationTeamCodes } = user

    return Promise.all(probationTeamCodes.map(teamCode => this.communityService.getManagedOffendersByTeam(teamCode)))
      .then(caseload => caseload.flat())
      .then(caseload => this.mapManagedOffenderRecordToOffenderDetail(caseload))
      .then(caseload => this.pairDeliusRecordsWithNomis(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildVaryCaseload(caseload))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  async getOmuCaseload(user: User): Promise<ManagedCase[]> {
    const { prisonCaseload } = user

    // Get cases with a licence in ACTIVE, APPROVED, or SUBMITTED state
    const casesWithLicences = this.licenceService
      .getLicencesForOmu(user)
      .then(licences => this.mapLicencesToOffenders(licences))

    // Get cases due for release soon which do not have a submitted licence
    const startOfThisWeek = moment().startOf('isoWeek')
    const endOfTheFourthWeekFromNow = moment().add(3, 'weeks').endOf('isoWeek')
    const casesPendingLicence = this.prisonerService
      .searchPrisonersByReleaseDate(startOfThisWeek, endOfTheFourthWeekFromNow, prisonCaseload, user)
      .then(caseload => this.pairNomisRecordsWithDelius(caseload))
      .then(caseload => this.filterOffendersEligibleForLicence(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))
      .then(caseload => this.buildCreateCaseload(caseload))
      .then(caseload => {
        return caseload.filter(c =>
          [
            LicenceStatus.NOT_STARTED,
            LicenceStatus.NOT_IN_PILOT,
            LicenceStatus.OOS_RECALL,
            LicenceStatus.OOS_BOTUS,
          ].some(status => c.licences.find(l => l.status === status))
        )
      })

    const combinedCases = await Promise.all([casesWithLicences, casesPendingLicence]).then(c => c.flat())

    return this.mapResponsibleComsToCases(combinedCases)
  }

  async getApproverCaseload(user: User): Promise<ManagedCase[]> {
    return this.licenceService
      .getLicencesForApproval(user)
      .then(licences => this.mapLicencesToOffenders(licences))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  async getVaryApproverCaseload(user: User): Promise<ManagedCase[]> {
    return this.licenceService
      .getLicencesForVariationApproval(user)
      .then(licences => this.mapLicencesToOffenders(licences))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
  }

  public pairNomisRecordsWithDelius = async (prisoners: Prisoner[]): Promise<ManagedCase[]> => {
    const caseloadNomisIds = prisoners
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
        return {}
      })
      .filter(offender => offender.nomisRecord && offender.deliusRecord)
  }

  public mapOffendersToLicences = async (offenders: ManagedCase[], user?: User): Promise<ManagedCase[]> => {
    const existingLicences = await this.licenceService.getLicencesByNomisIdsAndStatus(
      offenders.map(offender => offender.nomisRecord.prisonerNumber),
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

      const inRollout =
        prisonInRollout(offender.nomisRecord.prisonId) &&
        probationAreaInRollout(offender.deliusRecord.offenderManagers?.find(om => om.active)?.probationArea?.code)

      // Determine the likely type of intended licence from the prison record
      const licenceType = this.getLicenceType(offender.nomisRecord)

      // Default status (if not overridden below) will show the case as clickable on case lists
      let licenceStatus = LicenceStatus.NOT_STARTED

      if (!inRollout) {
        // Offender is not in a prison or probation that is inside the pilot area - not clickable
        licenceStatus = LicenceStatus.NOT_IN_PILOT
      } else if (this.isBreachOfTopUpSupervision(offender)) {
        // Imprisonment status indicates a breach of top up supervision order - not clickable (yet)
        licenceStatus = LicenceStatus.OOS_BOTUS
      } else if (this.isRecall(offender)) {
        // Offender is subject to an active recall - not clickable
        licenceStatus = LicenceStatus.OOS_RECALL
      }

      return { ...offender, licences: [{ status: licenceStatus, type: licenceType }] }
    })
  }

  public filterOffendersEligibleForLicence = async (offenders: ManagedCase[], user?: User) => {
    const eligibleOffenders = offenders
      .filter(offender => !offender.nomisRecord.paroleEligibilityDate)
      .filter(offender => offender.nomisRecord.legalStatus !== 'DEAD')
      .filter(offender => !offender.nomisRecord.indeterminateSentence)
      .filter(offender => offender.nomisRecord.conditionalReleaseDate)
      // TODO: Following filter rule can be removed after 11th July 2022
      .filter(
        offender =>
          !['FHI', 'LCI', 'LII', 'LGI', 'MHI', 'NSI', 'NMI', 'RNI', 'SKI', 'SUI', 'WTI'].includes(
            offender.nomisRecord.prisonId
          ) ||
          moment(offender.nomisRecord.conditionalReleaseDate, 'YYYY-MM-DD').isSameOrAfter(
            moment('2022-07-11', 'YYYY-MM-DD'),
            'day'
          )
      )

    if (eligibleOffenders.length === 0) return eligibleOffenders

    const hdcStatuses = await this.prisonerService.getHdcStatuses(
      eligibleOffenders.map(c => c.nomisRecord),
      user
    )

    return eligibleOffenders.filter(offender => {
      const hdcRecord = hdcStatuses.find(hdc => hdc.bookingId === offender.nomisRecord.bookingId)
      return !hdcRecord || hdcRecord.approvalStatus !== 'APPROVED'
    })
  }

  private buildCreateCaseload = (managedOffenders: ManagedCase[]): ManagedCase[] => {
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
        ].some(status => offender.licences.find(l => l.status === status))
      )
  }

  private buildVaryCaseload = (managedOffenders: ManagedCase[]): ManagedCase[] => {
    return managedOffenders.filter(offender =>
      [
        LicenceStatus.ACTIVE,
        LicenceStatus.VARIATION_IN_PROGRESS,
        LicenceStatus.VARIATION_SUBMITTED,
        LicenceStatus.VARIATION_APPROVED,
        LicenceStatus.VARIATION_REJECTED,
      ].some(status => offender.licences.find(l => l.status === status))
    )
  }

  private pairDeliusRecordsWithNomis = async (managedOffenders: DeliusRecord[], user: User): Promise<ManagedCase[]> => {
    const caseloadNomisIds = managedOffenders
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
      .filter(offender => offender.nomisRecord)
  }

  private mapLicencesToOffenders = async (licences: LicenceSummary[], user?: User): Promise<ManagedCase[]> => {
    const nomisIds = licences.map(l => l.nomisId)
    const deliusRecords = await this.communityService.getOffendersByNomsNumbers(nomisIds)
    const offenders = await this.pairDeliusRecordsWithNomis(deliusRecords, user)
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
            }
          }),
      }
    })
  }

  private async mapResponsibleComsToCases(caseload: ManagedCase[]): Promise<ManagedCase[]> {
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

  private getLicenceType = (nomisRecord: Prisoner): LicenceType => {
    if (!nomisRecord.topupSupervisionExpiryDate) {
      return LicenceType.AP
    }
    if (!nomisRecord.licenceExpiryDate && !nomisRecord.sentenceExpiryDate) {
      return LicenceType.PSS
    }
    return LicenceType.AP_PSS
  }

  private mapManagedOffenderRecordToOffenderDetail = async (
    caseload: CommunityApiManagedOffender[]
  ): Promise<DeliusRecord[]> => {
    const crns = caseload.map(c => c.offenderCrn)
    const offenders = await this.communityService.getOffendersByCrn(crns)
    return offenders.map(o => {
      return {
        ...o,
        ...caseload.find(c => c.offenderCrn === o.otherIds?.crn),
      }
    })
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
}
