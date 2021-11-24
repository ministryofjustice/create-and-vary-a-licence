import moment from 'moment'
import CommunityService from './communityService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import { CaseTypeAndStatus, ManagedCase } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'

export default class CaseloadService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService
  ) {}

  async getStaffCaseload(username: string, staffIdentifier: number): Promise<CaseTypeAndStatus[]> {
    // TODO: We could cache the entire caseload here?
    const managedOffenders = await this.communityService.getManagedOffenders(staffIdentifier)
    const caseloadNomisIds = managedOffenders
      .filter(offender => offender.currentOm)
      .filter(offender => offender.nomsNumber)
      .map(offender => offender.nomsNumber)

    /*
     TODO: Maybe this should be checking for existing licences by nomisId rather than staffId? What if the offender
      changes their managing officer after a licence has been created for them?
     */
    const existingLicences = await this.licenceService.getLicencesByStaffIdAndStatus(staffIdentifier, username, [
      LicenceStatus.ACTIVE,
      LicenceStatus.RECALLED,
      LicenceStatus.IN_PROGRESS,
      LicenceStatus.SUBMITTED,
      LicenceStatus.APPROVED,
      LicenceStatus.REJECTED,
    ])

    const offenders = await this.prisonerService.searchPrisonersByNomisIds(username, caseloadNomisIds)

    // TODO: Change to the POST endpoint for a list of bookingIds
    const hdcStatuses = await this.prisonerService.getHdcStatuses(username, offenders)

    return offenders
      .map(offender => {
        const matchingDeliusCase = managedOffenders.find(
          deliusCase => deliusCase.nomsNumber === offender.prisonerNumber
        )
        // TODO: The nomisId in Delius does not match a prison record - filter now, but will revisit to add a NO_RECORD
        if (!matchingDeliusCase) {
          return null
        }
        return {
          ...matchingDeliusCase,
          ...offender,
        } as ManagedCase
      })
      .filter(managedCase => managedCase)
      .filter(managedCase => !managedCase.paroleEligibilityDate)
      .filter(managedCase => managedCase.legalStatus !== 'DEAD')
      .filter(managedCase => managedCase.status && managedCase.status.startsWith('ACTIVE'))
      .filter(managedCase => !managedCase.indeterminateSentence && managedCase.conditionalReleaseDate)
      .filter(
        managedCase => !managedCase.releaseDate || moment().isBefore(moment(managedCase.releaseDate, 'YYYY-MM-DD'))
      )
      .filter(managedCase => {
        const hdcStatus = hdcStatuses.find(hdc => hdc.bookingId === managedCase.bookingId)
        return !hdcStatus?.eligibleForHdc
      })
      .map(managedCase => {
        const existingLicence = existingLicences.find(licence => licence.nomisId === managedCase.nomsNumber)
        if (existingLicence) {
          // Filter people with an ACTIVE, INACTIVE or RECALLED licence
          if (
            existingLicence.licenceStatus === LicenceStatus.ACTIVE ||
            existingLicence.licenceStatus === LicenceStatus.INACTIVE ||
            existingLicence.licenceStatus === LicenceStatus.RECALLED
          ) {
            return null
          }
          return {
            ...managedCase,
            licenceStatus: existingLicence.licenceStatus,
            licenceType: existingLicence.licenceType,
          } as CaseTypeAndStatus
        }

        // No current licence so work out the licence type from the prisoner search record
        const licenceType = this.getLicenceType(
          managedCase.topupSupervisionExpiryDate,
          managedCase.licenceExpiryDate,
          managedCase.sentenceExpiryDate
        )

        return {
          ...managedCase,
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType,
        } as CaseTypeAndStatus
      })
      .filter(managedCase => managedCase)
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
