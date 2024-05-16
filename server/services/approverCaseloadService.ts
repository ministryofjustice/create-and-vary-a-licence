import { format } from 'date-fns'
import CommunityService from './communityService'
import type { DeliusRecord, ProbationPractitioner } from '../@types/managedCase'
import LicenceStatus from '../enumeration/licenceStatus'
import { User } from '../@types/CvlUserDetails'
import type { CvlPrisoner, LicenceSummaryApproverView } from '../@types/licenceApiClientTypes'

import {
  convertToTitleCase,
  filterCentralCaseload,
  parseCvlDate,
  parseCvlDateTime,
  selectReleaseDate,
} from '../utils/utils'
import { LicenceApiClient } from '../data'
import { CommunityApiStaffDetails } from '../@types/communityClientTypes'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'

export type ApprovalCase = {
  licenceId: number
  name: string
  prisonerNumber: string
  submittedByFullName: string
  releaseDate: string
  sortDate: Date
  urgentApproval: boolean
  approvedBy: string
  approvedOn: string
  isDueForEarlyRelease: boolean
  probationPractitioner: ProbationPractitioner
}

export default class ApproverCaseloadService {
  constructor(
    private readonly communityService: CommunityService,
    private readonly licenceApiClient: LicenceApiClient
  ) {}

  async getApprovalNeeded(user: User, prisonCaseload: string[], searchString: string): Promise<ApprovalCase[]> {
    const licences: LicenceSummaryApproverView[] = await this.licenceApiClient.getLicencesForApproval(
      filterCentralCaseload(prisonCaseload),
      user
    )
    const caseLoad: ApprovalCase[] = await this.mapLicencesToOffenders(licences)
    return this.applySearch(searchString, caseLoad)
  }

  async getRecentlyApproved(user: User, prisonCaseload: string[], searchString: string): Promise<ApprovalCase[]> {
    const licences: LicenceSummaryApproverView[] = await this.licenceApiClient.getLicencesRecentlyApproved(
      filterCentralCaseload(prisonCaseload),
      user
    )
    const caseLoad: ApprovalCase[] = await this.mapLicencesToOffenders(licences)
    return this.applySearch(searchString, caseLoad)
  }

  private mapLicencesToOffenders = async (
    licences: LicenceSummaryApproverView[],
    user?: User
  ): Promise<ApprovalCase[]> => {
    const nomisIds = licences.map(l => l.nomisId)
    const deliusRecords = await this.communityService.getOffendersByNomsNumbers(nomisIds)
    const caseloadNomisIds = deliusRecords
      .map(offender => offender.otherIds?.nomsNumber)
      .filter(nomsNumber => Boolean(nomsNumber))

    const nomisRecords = await this.licenceApiClient.searchPrisonersByNomsIds(caseloadNomisIds, user)

    const caseload = deliusRecords
      .map(offender => {
        return {
          deliusRecord: offender,
          nomisRecord: nomisRecords.find(({ prisoner }) => prisoner.prisonerNumber === offender.otherIds?.nomsNumber)
            ?.prisoner,
        }
      })
      .filter(offender => offender.nomisRecord)
      .map(offender => {
        return this.toApprovalCase(offender, licences)
      })

    const comUsernames = caseload
      .map(({ comUsernameOnLicence }) => comUsernameOnLicence)
      .filter(comUsername => comUsername)

    const coms = await this.communityService.getStaffDetailsByUsernameList(comUsernames)

    return caseload
      .map(offender => {
        return {
          ...offender.licence,
          probationPractitioner: this.findProbationPractioner(offender, coms),
        }
      })
      .sort((a, b) => (a.sortDate?.getTime() || 0) - (b.sortDate?.getTime() || 0))
  }

  private toApprovalCase(
    offender: { nomisRecord: CvlPrisoner; deliusRecord: OffenderDetail },
    licences: LicenceSummaryApproverView[]
  ) {
    const { nomisRecord } = offender
    const offenderLicences = licences.filter(l => l.nomisId === nomisRecord.prisonerNumber)
    const licence =
      offenderLicences.length === 1
        ? offenderLicences[0]
        : // licences to approve will always be SUBMITTED, recently approved will either be APPROVED or ACTIVE
          offenderLicences.find(l => l.licenceStatus !== LicenceStatus.ACTIVE)

    const releaseDate =
      (licence && parseCvlDate(licence.actualReleaseDate || licence.conditionalReleaseDate)) ||
      selectReleaseDate(nomisRecord)

    const approvedDate = parseCvlDateTime(licence?.approvedDate, { withSeconds: true })

    return {
      deliusRecord: offender.deliusRecord,
      comUsernameOnLicence: licence?.comUsername,
      licence: licence && {
        licenceId: licence.licenceId,
        name: convertToTitleCase(`${nomisRecord.firstName} ${nomisRecord.lastName}`.trim()),
        prisonerNumber: nomisRecord.prisonerNumber,
        submittedByFullName: licence.submittedByFullName,
        releaseDate: releaseDate ? format(releaseDate, 'dd MMM yyyy') : 'not found',
        sortDate: releaseDate,
        urgentApproval: licence.isDueToBeReleasedInTheNextTwoWorkingDays,
        approvedBy: licence.approvedByName,
        approvedOn: approvedDate ? format(approvedDate, 'dd MMM yyyy') : null,
        isDueForEarlyRelease: licence.isDueForEarlyRelease,
      },
    }
  }

  findProbationPractioner(
    offender: {
      deliusRecord?: DeliusRecord
      comUsernameOnLicence: string
    },
    coms: CommunityApiStaffDetails[]
  ): ProbationPractitioner {
    const responsibleCom = coms.find(
      com => com.username?.toLowerCase() === offender.comUsernameOnLicence?.toLowerCase()
    )

    if (responsibleCom) {
      return {
        staffCode: responsibleCom.staffCode,
        name: `${responsibleCom.staff.forenames} ${responsibleCom.staff.surname}`.trim(),
      }
    }

    const { staff } = offender.deliusRecord
    if (!staff || staff.unallocated) {
      return null
    }

    return {
      staffCode: staff.code,
      name: `${staff.forenames} ${staff.surname}`.trim(),
    }
  }

  applySearch(searchString: string, cases: ApprovalCase[]): ApprovalCase[] {
    if (!searchString) return cases
    const term = searchString?.toLowerCase()
    return cases.filter(c => {
      return (
        c.name.toLowerCase().includes(term) ||
        c.prisonerNumber?.toLowerCase().includes(term) ||
        c.probationPractitioner?.name.toLowerCase().includes(term)
      )
    })
  }
}
