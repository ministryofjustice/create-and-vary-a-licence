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

    const eligibleOffenders = await Promise.all(
      prisonCaseload.map(prison => this.prisonerService.searchPrisonersByPrison(prison, user))
    )
      .then(caseload => caseload.flat())
      .then(caseload => {
        // TODO: This .then() block is temporary to reduce the number of offenders being searched in probation-offender-search. A more permanent
        //  fix will be to have an endpoint to search nomis by CRD (CVSL-492).
        //  Temporary fix is to filter only prisoners who have a CRD in the next 13 weeks before searching them on delius
        return caseload.filter(
          offender =>
            (offender.conditionalReleaseDate &&
              moment(offender.conditionalReleaseDate, 'YYYY-MM-DD').isSameOrAfter(moment(), 'day') &&
              moment(offender.conditionalReleaseDate, 'YYYY-MM-DD').isBefore(moment().add(13, 'weeks'), 'day')) ||
            (offender.confirmedReleaseDate &&
              moment(offender.confirmedReleaseDate, 'YYYY-MM-DD').isSameOrAfter(moment(), 'day') &&
              moment(offender.confirmedReleaseDate, 'YYYY-MM-DD').isBefore(moment().add(13, 'weeks'), 'day'))
        )
      })
      .then(caseload => this.pairNomisRecordsWithDelius(caseload))
      .then(caseload => this.filterOffendersEligibleForLicence(caseload, user))
      .then(caseload => this.mapOffendersToLicences(caseload, user))

    const casesWithLicences = eligibleOffenders.filter(offender =>
      [LicenceStatus.ACTIVE, LicenceStatus.SUBMITTED, LicenceStatus.APPROVED].some(status =>
        offender.licences.find(l => l.status === status)
      )
    )
    const casesPendingLicence = this.buildCreateCaseload(eligibleOffenders)
      .filter(c =>
        [LicenceStatus.NOT_STARTED, LicenceStatus.NOT_IN_PILOT, LicenceStatus.IN_PROGRESS].some(status =>
          c.licences.find(l => l.status === status)
        )
      )
      .filter(
        c =>
          (c.nomisRecord.conditionalReleaseDate &&
            moment(c.nomisRecord.conditionalReleaseDate, 'YYYY-MM-DD').isSameOrBefore(
              moment().add(4, 'weeks'),
              'day'
            )) ||
          (c.nomisRecord.confirmedReleaseDate &&
            moment(c.nomisRecord.confirmedReleaseDate, 'YYYY-MM-DD').isSameOrBefore(moment().add(4, 'weeks'), 'day'))
      )

    return this.mapResponsibleComsToCases([...casesWithLicences, ...casesPendingLicence])
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

      // Work out the licence type from the prisoner search record
      const licenceType = this.getLicenceType(offender.nomisRecord)

      // Create a case in the list in status NOT_STARTED or NOT_IN_PILOT
      return {
        ...offender,
        licences: [
          {
            status:
              prisonInRollout(offender.nomisRecord.prisonId) &&
              probationAreaInRollout(
                offender.deliusRecord.offenderManagers?.find(om => om.active)?.probationArea?.code
              ) &&
              !this.isRecall(offender) &&
              !this.isBreachOfTopUpSupervision(offender)
                ? LicenceStatus.NOT_STARTED
                : LicenceStatus.NOT_IN_PILOT,
            type: licenceType,
          },
        ],
      }
    })
  }

  public filterOffendersEligibleForLicence = async (offenders: ManagedCase[], user?: User) => {
    const eligibleOffenders = offenders
      .filter(offender => !offender.nomisRecord.paroleEligibilityDate)
      .filter(offender => offender.nomisRecord.legalStatus !== 'DEAD')
      .filter(offender => !offender.nomisRecord.indeterminateSentence)
      // TODO: Following filter rules can be removed after 18th April 2022
      .filter(
        offender =>
          (offender.nomisRecord.conditionalReleaseDate &&
            moment(offender.nomisRecord.conditionalReleaseDate, 'YYYY-MM-DD').isSameOrAfter(
              moment('2022-04-18', 'YYYY-MM-DD'),
              'day'
            )) ||
          (offender.nomisRecord.confirmedReleaseDate &&
            moment(offender.nomisRecord.confirmedReleaseDate, 'YYYY-MM-DD').isSameOrAfter(
              moment('2022-04-18', 'YYYY-MM-DD'),
              'day'
            ))
      )

    const hdcStatuses = await this.prisonerService.getHdcStatuses(
      eligibleOffenders.map(c => c.nomisRecord),
      user
    )

    return eligibleOffenders.filter(offender => {
      const hdcStatus = hdcStatuses.find(hdc => hdc.bookingId === offender.nomisRecord.bookingId)
      return !hdcStatus?.eligibleForHdc
    })
  }

  private buildCreateCaseload = (managedOffenders: ManagedCase[]): ManagedCase[] => {
    return managedOffenders
      .filter(offender => offender.nomisRecord.status && offender.nomisRecord.status.startsWith('ACTIVE'))
      .filter(
        offender =>
          !offender.nomisRecord.releaseDate ||
          moment().isSameOrBefore(moment(offender.nomisRecord.releaseDate, 'YYYY-MM-DD'), 'day')
      )
      .filter(offender =>
        [
          LicenceStatus.NOT_STARTED,
          LicenceStatus.NOT_IN_PILOT,
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

    // Get the confirmed release date (if present) or CRD, and use in that order of preference
    const releaseDate = offender.nomisRecord?.confirmedReleaseDate
      ? moment(offender.nomisRecord.confirmedReleaseDate, 'YYYY-MM-DD')
      : moment(offender.nomisRecord.conditionalReleaseDate, 'YYYY-MM-DD')

    // Get the post recall release date (if present) or set to undefined.
    const postRecallReleaseDate = offender.nomisRecord?.postRecallReleaseDate
      ? moment(offender.nomisRecord?.postRecallReleaseDate, 'YYYY-MM-DD')
      : undefined

    // If the post-recall release date is AFTER the release date, then it is a genuine recall.
    // If the post-recall release date is BEFORE or EQUAL to the release date - we ignore the recall flag.
    // This catches the situation where multiple sentences exist and the recall applies to a previous sentence.
    if (recall && releaseDate && postRecallReleaseDate) {
      return postRecallReleaseDate.isAfter(releaseDate)
    }

    // Trust the Nomis recall flag as a fallback position if other data is not present.
    return recall
  }

  private isBreachOfTopUpSupervision = (offender: ManagedCase): boolean => {
    return offender.nomisRecord?.imprisonmentStatus && offender.nomisRecord?.imprisonmentStatus === 'BOTUS'
  }
}
