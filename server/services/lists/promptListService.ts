import CommunityService from '../communityService'
import PrisonerService from '../prisonerService'
import LicenceService from '../licenceService'
import { ManagedCase } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { User } from '../../@types/CvlUserDetails'
import type { CaseloadItem } from '../../@types/licenceApiClientTypes'
import LicenceKind from '../../enumeration/LicenceKind'
import { parseCvlDate, parseIsoDate } from '../../utils/utils'
import CaseListUtils from './caselistUtils'

export default class PromptListService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService
  ) {}

  public pairNomisRecordsWithDelius = async (prisoners: Array<CaseloadItem>): Promise<Array<ManagedCase>> => {
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
      const licenceType = CaseListUtils.getLicenceType(offender.nomisRecord)

      // Default status (if not overridden below) will show the case as clickable on case lists
      let licenceStatus = LicenceStatus.NOT_STARTED

      if (CaseListUtils.isBreachOfTopUpSupervision(offender)) {
        // Imprisonment status indicates a breach of top up supervision order - not clickable (yet)
        licenceStatus = LicenceStatus.OOS_BOTUS
      } else if (CaseListUtils.isRecall(offender)) {
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

  public filterOffendersEligibleForLicence = async (offenders: Array<ManagedCase>, user?: User) => {
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
}
