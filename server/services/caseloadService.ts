import moment from 'moment'
import CommunityService from './communityService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import { CaseTypeAndStatus } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { User } from '../@types/CvlUserDetails'
import { LicenceSummary } from '../@types/licenceApiClientTypes'

export default class CaseloadService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService
  ) {}

  async getStaffCaseload(user: User): Promise<CaseTypeAndStatus[]> {
    const { deliusStaffIdentifier } = user

    const managedOffenders = await this.communityService.getManagedOffenders(deliusStaffIdentifier)

    const caseloadNomisIds = managedOffenders
      .filter(offender => offender.nomsNumber)
      .map(offender => offender.nomsNumber)

    const offendersLicences = await this.mapOffendersToLicences(caseloadNomisIds, user)

    // Combine nomis + licence record with matching delius record by nomisId
    return offendersLicences.map(offender => {
      return { ...offender, ...managedOffenders.find(o => o.nomsNumber === offender.prisonerNumber) }
    })
  }

  async getTeamCaseload(user: User): Promise<CaseTypeAndStatus[]> {
    const { probationTeams } = user

    const managedOffenders = await this.communityService.getManagedOffendersByTeam(probationTeams)

    const caseloadNomisIds = managedOffenders
      .filter(offender => offender.nomsNumber)
      .map(offender => offender.nomsNumber)

    const offendersLicences = await this.mapOffendersToLicences(caseloadNomisIds, user)

    // Combine nomis + licence record with matching delius record by nomisId
    return offendersLicences.map(offender => {
      return { ...offender, ...managedOffenders.find(o => o.nomsNumber === offender.prisonerNumber) }
    })
  }

  async getVaryCaseload(user: User): Promise<LicenceSummary[]> {
    const { deliusStaffIdentifier } = user
    const managedOffenders = await this.communityService.getManagedOffenders(deliusStaffIdentifier)
    const caseloadNomisIds = managedOffenders
      .filter(offender => offender.currentOm)
      .filter(offender => offender.nomsNumber)
      .map(offender => offender.nomsNumber)

    return this.licenceService.getLicencesByNomisIdsAndStatus(caseloadNomisIds, [LicenceStatus.ACTIVE], user)
  }

  private mapOffendersToLicences = async (caseloadNomisIds: string[], user: User): Promise<CaseTypeAndStatus[]> => {
    const [offenders, existingLicences] = await Promise.all([
      this.getOffendersEligibleForLicenceByNomisId(caseloadNomisIds, user),
      this.getExistingLicences(caseloadNomisIds, user),
    ])

    // TODO: If the length(offenders) !== length(managedOffenders), it means a managed offender in delius was not found in nomis and a NO_RECORD should be raised

    return offenders
      .map(offender => {
        const existingLicence = existingLicences.find(licence => licence.nomisId === offender.prisonerNumber)
        if (existingLicence) {
          if (
            existingLicence.licenceStatus === LicenceStatus.ACTIVE ||
            existingLicence.licenceStatus === LicenceStatus.INACTIVE ||
            existingLicence.licenceStatus === LicenceStatus.RECALLED
          ) {
            // Filter cases in the list if their status is ACTIVE, INACTIVE or RECALLED (these are vary candidates)
            return null
          }

          // Return a case in the list for the existing licence
          return {
            ...offender,
            licenceStatus: existingLicence.licenceStatus,
            licenceType: existingLicence.licenceType,
          } as CaseTypeAndStatus
        }

        // Work out the licence type from the prisoner search record
        const licenceType = this.getLicenceType(
          offender.topupSupervisionExpiryDate,
          offender.licenceExpiryDate,
          offender.sentenceExpiryDate
        )

        // Create a case in the list in status NOT_STARTED
        return { ...offender, licenceStatus: LicenceStatus.NOT_STARTED, licenceType } as CaseTypeAndStatus
      })
      .filter(managedCase => managedCase)
  }

  private getExistingLicences = async (nomisIds: string[], user: User) => {
    return this.licenceService.getLicencesByNomisIdsAndStatus(
      nomisIds,
      [
        LicenceStatus.ACTIVE,
        LicenceStatus.RECALLED,
        LicenceStatus.IN_PROGRESS,
        LicenceStatus.SUBMITTED,
        LicenceStatus.APPROVED,
        LicenceStatus.REJECTED,
      ],
      user
    )
  }

  private getOffendersEligibleForLicenceByNomisId = async (nomisIds: string[], user: User) => {
    let offenders = await this.prisonerService.searchPrisonersByNomisIds(nomisIds, user)
    offenders = offenders
      .filter(managedCase => !managedCase.paroleEligibilityDate)
      .filter(managedCase => managedCase.legalStatus !== 'DEAD')
      .filter(managedCase => managedCase.status && managedCase.status.startsWith('ACTIVE'))
      .filter(managedCase => !managedCase.indeterminateSentence && managedCase.conditionalReleaseDate)
      .filter(
        managedCase =>
          !managedCase.releaseDate || moment().isSameOrBefore(moment(managedCase.releaseDate, 'YYYY-MM-DD'))
      )

    const hdcStatuses = await this.prisonerService.getHdcStatuses(offenders, user)

    return offenders
      .filter(offender => {
        const hdcStatus = hdcStatuses.find(hdc => hdc.bookingId === offender.bookingId)
        return !hdcStatus?.eligibleForHdc
      })
      .sort((a, b) => {
        const crd1 = moment(a.conditionalReleaseDate, 'YYYY-MM-DD').unix()
        const crd2 = moment(b.conditionalReleaseDate, 'YYYY-MM-DD').unix()
        return crd1 - crd2
      })
  }

  private getLicenceType = (tused: string, led: string, sed: string): LicenceType => {
    if (!tused) {
      return LicenceType.AP
    }
    if (!led && !sed) {
      return LicenceType.PSS
    }
    return LicenceType.AP_PSS
  }
}
