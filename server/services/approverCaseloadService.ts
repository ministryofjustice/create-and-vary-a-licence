import CommunityService from './communityService'
import PrisonerService from './prisonerService'
import { DeliusRecord, ManagedCaseForApproval } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { User } from '../@types/CvlUserDetails'
import { LicenceSummaryApproverView } from '../@types/licenceApiClientTypes'
import LicenceKind from '../enumeration/LicenceKind'
import { filterCentralCaseload } from '../utils/utils'
import { LicenceApiClient } from '../data'

export default class ApproverCaseloadService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly licenceApiClient: LicenceApiClient
  ) {}

  async getApprovalNeeded(user: User, prisonCaseload: string[]): Promise<ManagedCaseForApproval[]> {
    const licences: LicenceSummaryApproverView[] = await this.licenceApiClient.getLicencesForApproval(
      filterCentralCaseload(prisonCaseload),
      user
    )
    const caseLoad: ManagedCaseForApproval[] = await this.mapLicencesToOffenders(licences)
    return this.mapResponsibleComsToCases(caseLoad)
  }

  async getRecentlyApproved(user: User, prisonCaseload: string[]): Promise<ManagedCaseForApproval[]> {
    const licences: LicenceSummaryApproverView[] = await this.licenceApiClient.getLicencesRecentlyApproved(
      filterCentralCaseload(prisonCaseload),
      user
    )
    const caseLoad: ManagedCaseForApproval[] = await this.mapLicencesToOffenders(licences)
    return this.mapResponsibleComsToCases(caseLoad)
  }

  private pairDeliusRecordsWithNomis = async (
    managedOffenders: DeliusRecord[],
    user: User
  ): Promise<ManagedCaseForApproval[]> => {
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

  private mapLicencesToOffenders = async (
    licences: LicenceSummaryApproverView[],
    user?: User
  ): Promise<ManagedCaseForApproval[]> => {
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
              dateCreated: l.dateCreated,
              approvedBy: l.approvedByName,
              approvedDate: l.approvedDate,
              versionOf: l.versionOf,
              kind: <LicenceKind>l.kind,
              submittedByFullName: l.submittedByFullName,
            }
          }),
      }
    })
  }

  private async mapResponsibleComsToCases(caseload: ManagedCaseForApproval[]): Promise<ManagedCaseForApproval[]> {
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
