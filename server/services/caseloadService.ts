import moment from 'moment'
import CommunityService from './communityService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import { CaseTypeAndStatus, ManagedCase } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { User } from '../@types/CvlUserDetails'

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
      .filter(offender => offender.currentOm)
      .filter(offender => offender.nomsNumber)
      .map(offender => offender.nomsNumber)

    /*
     TODO: Maybe this should be checking for existing licences by nomisId rather than staffId? What if the offender
      changes their managing officer after a licence has been created for them?
     */

    const existingLicences = await this.licenceService.getLicencesByStaffIdAndStatus(
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

    // Get the full offender records from prisoner search
    const offenders = await this.prisonerService.searchPrisonersByNomisIds(caseloadNomisIds, user)

    // Get the HDC status for all bookings in the prisoner list
    const hdcStatuses = await this.prisonerService.getHdcStatuses(offenders, user)

    // Filter the cases by the case list rules
    return offenders
      .map(offender => {
        const matchingDeliusCase = managedOffenders.find(
          deliusCase => deliusCase.nomsNumber === offender.prisonerNumber
        )
        // TODO: If the nomisId in Delius does not match a prison record - filter for now, will revisit to add a NO_RECORD
        if (!matchingDeliusCase) {
          return null
        }
        return { ...matchingDeliusCase, ...offender } as ManagedCase
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
            ...managedCase,
            licenceStatus: existingLicence.licenceStatus,
            licenceType: existingLicence.licenceType,
          } as CaseTypeAndStatus
        }

        // Work out the licence type from the prisoner search record
        const licenceType = this.getLicenceType(
          managedCase.topupSupervisionExpiryDate,
          managedCase.licenceExpiryDate,
          managedCase.sentenceExpiryDate
        )

        // Create a case in the list in status NOT_STARTED
        return { ...managedCase, licenceStatus: LicenceStatus.NOT_STARTED, licenceType } as CaseTypeAndStatus
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
