import { format } from 'date-fns'
import moment from 'moment'
import _ from 'lodash'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import { DeliusRecord, ManagedCase, ProbationPractitioner } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { User } from '../../@types/CvlUserDetails'
import type { LicenceSummary } from '../../@types/licenceApiClientTypes'
import LicenceKind from '../../enumeration/LicenceKind'
import { convertToTitleCase, parseCvlDate, parseCvlDateTime, parseIsoDate } from '../../utils/utils'

export type VaryApprovalCase = {
  licenceId: number
  name: string
  crnNumber: string
  licenceType: LicenceType
  variationRequestDate: string
  releaseDate: string
  probationPractitioner: ProbationPractitioner
}

export default class CaseloadService {
  constructor(
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService
  ) {}

  async getVaryApproverCaseload(user: User, search: string): Promise<VaryApprovalCase[]> {
    return this.licenceService
      .getLicencesForVariationApproval(user)
      .then(licences => this.mapLicencesToOffenders(licences))
      .then(caseload => this.mapResponsibleComsToCases(search, caseload))
  }

  async getVaryApproverCaseloadByRegion(user: User, search: string = undefined): Promise<VaryApprovalCase[]> {
    return this.licenceService
      .getLicencesForVariationApprovalByRegion(user)
      .then(licences => this.mapLicencesToOffenders(licences))
      .then(caseload => this.mapResponsibleComsToCases(search, caseload))
  }

  private pairDeliusRecordsWithNomis = async (managedOffenders: DeliusRecord[], user: User): Promise<ManagedCase[]> => {
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
            const releaseDate = l.actualReleaseDate || l.conditionalReleaseDate
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

  private async mapResponsibleComsToCases(search: string, caseload: ManagedCase[]): Promise<VaryApprovalCase[]> {
    const comUsernames = caseload
      .map(
        offender =>
          offender.licences.find(l => offender.licences.length === 1 || l.status !== LicenceStatus.ACTIVE).comUsername
      )
      .filter(comUsername => comUsername)

    const coms = await this.communityService.getStaffDetailsByUsernameList(comUsernames)

    return caseload
      .map(offender => {
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
      .map(c => {
        const licence = _.head(c.licences)

        const releaseDate = c.nomisRecord.releaseDate
          ? format(parseIsoDate(c.nomisRecord.releaseDate), 'dd MMM yyyy')
          : null

        const variationRequestDate = licence.dateCreated
          ? format(parseCvlDateTime(licence.dateCreated, { withSeconds: false }), 'dd MMMM yyyy')
          : null

        return {
          licenceId: licence.id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          crnNumber: c.deliusRecord.otherIds.crn,
          licenceType: licence.type,
          variationRequestDate,
          releaseDate,
          probationPractitioner: c.probationPractitioner,
        }
      })
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.crnNumber?.toLowerCase().includes(searchString) ||
          c.name.toLowerCase().includes(searchString) ||
          c.probationPractitioner?.name.toLowerCase().includes(searchString)
        )
      })
      .sort((a, b) => {
        const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
        const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
        return crd1 - crd2
      })
  }
}
