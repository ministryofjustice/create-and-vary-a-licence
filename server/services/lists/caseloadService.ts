import { format } from 'date-fns'
import moment from 'moment'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import { DeliusRecord, ProbationPractitioner } from '../../@types/managedCase'
import LicenceType from '../../enumeration/licenceType'
import { User } from '../../@types/CvlUserDetails'
import type { CvlPrisoner, LicenceSummary } from '../../@types/licenceApiClientTypes'
import {
  assertContainsNoDuplicates,
  associateBy,
  convertToTitleCase,
  parseCvlDateTime,
  parseIsoDate,
} from '../../utils/utils'
import { CommunityApiStaffDetails } from '../../@types/communityClientTypes'

export type VaryApprovalCase = {
  licenceId: number
  name: string
  crnNumber: string
  licenceType: LicenceType
  variationRequestDate: string
  releaseDate: string
  probationPractitioner: ProbationPractitioner
}

type Case = {
  deliusRecord?: DeliusRecord
  nomisRecord?: CvlPrisoner
  licence: LicenceSummary
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
      .then(licences => this.buildCase(licences))
      .then(caseload => this.sortAndFilter(search, caseload))
  }

  async getVaryApproverCaseloadByRegion(user: User, search: string = undefined): Promise<VaryApprovalCase[]> {
    return this.licenceService
      .getLicencesForVariationApprovalByRegion(user)
      .then(licences => this.buildCase(licences))
      .then(caseload => this.sortAndFilter(search, caseload))
  }

  private linkRecords = async (licences: LicenceSummary[], user: User): Promise<Case[]> => {
    const deliusRecords = await this.communityService.getOffendersByNomsNumbers(licences.map(l => l.nomisId))

    const caseloadNomisIds = deliusRecords.map(offender => offender.otherIds?.nomsNumber).filter(nomisId => nomisId)

    const nomisRecords = await this.licenceService.searchPrisonersByNomsIds(caseloadNomisIds, user)

    const deliusRecordByPrisonNumber = associateBy(deliusRecords, record => record.otherIds.nomsNumber)
    const nomisRecordByPrisonNumber = associateBy(nomisRecords, record => record.prisoner.prisonerNumber)

    const comUsernames = licences.map(licence => licence.comUsername).filter(comUsername => comUsername)
    const coms = await this.communityService.getStaffDetailsByUsernameList(comUsernames)

    return licences
      .map(licence => {
        const deliusRecord = deliusRecordByPrisonNumber[licence.nomisId]
        return {
          licence,
          deliusRecord,
          nomisRecord: nomisRecordByPrisonNumber[licence.nomisId]?.prisoner,
          probationPractitioner: getProbationPractioner(coms, licence.comUsername, deliusRecord),
        }
      })
      .filter(licence => licence.nomisRecord)
  }

  private buildCase = async (licences: LicenceSummary[], user?: User): Promise<VaryApprovalCase[]> => {
    assertContainsNoDuplicates(licences, l => l.nomisId)
    const cases = await this.linkRecords(licences, user)

    return cases.map(({ licence, deliusRecord, nomisRecord, probationPractitioner }) => {
      const releaseDate = nomisRecord.releaseDate ? format(parseIsoDate(nomisRecord.releaseDate), 'dd MMM yyyy') : null

      const variationRequestDate = licence.dateCreated
        ? format(parseCvlDateTime(licence.dateCreated, { withSeconds: false }), 'dd MMMM yyyy')
        : null

      return {
        licenceId: licence.licenceId,
        name: convertToTitleCase(`${nomisRecord.firstName} ${nomisRecord.lastName}`.trim()),
        crnNumber: deliusRecord.otherIds.crn,
        licenceType: <LicenceType>licence.licenceType,
        variationRequestDate,
        releaseDate,
        probationPractitioner,
      }
    })
  }

  private sortAndFilter = (search: string, caseload: VaryApprovalCase[]) =>
    caseload
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

const getProbationPractioner = (
  coms: CommunityApiStaffDetails[],
  comUsername: string,
  deliusRecord: DeliusRecord
): ProbationPractitioner => {
  const responsibleCom = coms.find(com => com.username?.toLowerCase() === comUsername?.toLowerCase())

  if (responsibleCom) {
    return {
      staffCode: responsibleCom.staffCode,
      name: `${responsibleCom.staff.forenames} ${responsibleCom.staff.surname}`.trim(),
    }
  }

  if (!deliusRecord.staff || deliusRecord.staff?.unallocated) {
    return undefined
  }

  return {
    staffCode: deliusRecord.staff.code,
    name: `${deliusRecord.staff.forenames} ${deliusRecord.staff.surname}`.trim(),
  }
}
