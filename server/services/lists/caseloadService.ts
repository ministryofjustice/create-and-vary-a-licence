import ProbationService from '../probationService'
import LicenceService from '../licenceService'
import { ManagedCase } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { User } from '../../@types/CvlUserDetails'
import type { LicenceSummary } from '../../@types/licenceApiClientTypes'
import LicenceKind from '../../enumeration/LicenceKind'
import { parseCvlDate } from '../../utils/utils'
import { nameToString } from '../../data/deliusClient'
import { DeliusRecord } from '../../@types/deliusClientTypes'

export default class CaseloadService {
  constructor(
    private readonly probationService: ProbationService,
    private readonly licenceService: LicenceService,
  ) {}

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

  private pairDeliusRecordsWithNomis = async (managedOffenders: DeliusRecord[], user: User): Promise<ManagedCase[]> => {
    const caseloadNomisIds = managedOffenders.filter(offender => offender.nomisId).map(offender => offender.nomisId)

    const nomisRecords = await this.licenceService.searchPrisonersByNomsIds(caseloadNomisIds, user)

    return managedOffenders
      .map(offender => {
        const { prisoner, cvl: cvlFields } =
          nomisRecords.find(({ prisoner }) => prisoner.prisonerNumber === offender.nomisId) || {}
        return {
          deliusRecord: offender,
          nomisRecord: prisoner,
          cvlFields,
        }
      })
      .filter(offender => offender.nomisRecord, 'unable to find prison record')
  }

  private mapLicencesToOffenders = async (licences: LicenceSummary[], user?: User): Promise<ManagedCase[]> => {
    const nomisIds = licences.map(l => l.nomisId)
    const deliusRecords = await this.probationService.getProbationers(nomisIds)
    const offenders = await this.pairDeliusRecordsWithNomis(deliusRecords, user)
    return offenders.map(offender => {
      return {
        ...offender,
        licences: licences
          .filter(l => l.nomisId === offender.nomisRecord.prisonerNumber)
          .map(l => {
            const releaseDate = l.licenceStartDate
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

  private async mapResponsibleComsToCases(caseload: ManagedCase[]): Promise<ManagedCase[]> {
    const comUsernames = caseload
      .map(
        offender =>
          offender.licences.find(l => offender.licences.length === 1 || l.status !== LicenceStatus.ACTIVE).comUsername,
      )
      .filter(comUsername => comUsername)

    const deliusStaffNames = await this.probationService.getStaffDetailsByUsernameList(comUsernames)
    const coms = await this.probationService.getResponsibleCommunityManagers(
      caseload.map(o => o.deliusRecord.crn).filter(crn => crn),
    )

    return caseload.map(offender => {
      const responsibleCom = deliusStaffNames.find(
        com =>
          com.username?.toLowerCase() ===
          offender.licences
            .find(l => offender.licences.length === 1 || l.status !== LicenceStatus.ACTIVE)
            .comUsername?.toLowerCase(),
      )

      if (responsibleCom) {
        return {
          ...offender,
          probationPractitioner: {
            staffCode: responsibleCom.code,
            name: nameToString(responsibleCom.name),
          },
        }
      }

      const com = coms.find(com => com.case.crn === offender.deliusRecord.crn)
      if (!com || com.unallocated) {
        return {
          ...offender,
        }
      }

      return {
        ...offender,
        probationPractitioner: {
          staffCode: com.code,
          name: nameToString(com.name),
        },
      }
    })
  }
}
