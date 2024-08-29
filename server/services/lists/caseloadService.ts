import { format } from 'date-fns'
import moment from 'moment'
import assert from 'assert'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import { DeliusRecord, ProbationPractitioner } from '../../@types/managedCase'
import LicenceType from '../../enumeration/licenceType'
import { User } from '../../@types/CvlUserDetails'
import type { CvlPrisoner, LicenceSummary } from '../../@types/licenceApiClientTypes'
import { associateBy, convertToTitleCase, parseCvlDateTime, parseIsoDate } from '../../utils/utils'

export type VaryApprovalCase = {
  licenceId: number
  name: string
  crnNumber: string
  licenceType: LicenceType
  variationRequestDate: string
  releaseDate: string
  probationPractitioner: ProbationPractitioner
}

type NomisAndDeliusPair = { deliusRecord?: DeliusRecord; nomisRecord?: CvlPrisoner }

type ManagedCase = Omit<VaryApprovalCase, 'probationPractitioner'> & {
  deliusRecord: DeliusRecord
  comUsername: string
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

  private pairDeliusRecordsWithNomis = async (
    licences: LicenceSummary[],
    user: User
  ): Promise<NomisAndDeliusPair[]> => {
    const deliusRecords = await this.communityService.getOffendersByNomsNumbers(licences.map(l => l.nomisId))

    const caseloadNomisIds = deliusRecords
      .map(offender => offender.otherIds?.nomsNumber)
      .filter(nomsNumber => nomsNumber)

    const nomisRecords = await this.licenceService.searchPrisonersByNomsIds(caseloadNomisIds, user)
    const nomisRecord = associateBy(nomisRecords, record => record.prisoner.prisonerNumber)

    return deliusRecords
      .map(offender => ({
        deliusRecord: offender,
        nomisRecord: nomisRecord[offender.otherIds?.nomsNumber]?.prisoner,
      }))
      .filter(offender => offender.nomisRecord)
  }

  private mapLicencesToOffenders = async (licences: LicenceSummary[], user?: User): Promise<ManagedCase[]> => {
    const offenders = await this.pairDeliusRecordsWithNomis(licences, user)

    return offenders.map(offender => {
      const foundLicences = licences.filter(l => l.nomisId === offender.nomisRecord.prisonerNumber)
      assert(foundLicences.length === 1, `offender '${offender.nomisRecord.prisonerNumber}' has more than one licence`)

      const licence = foundLicences[0]

      const releaseDate = offender.nomisRecord.releaseDate
        ? format(parseIsoDate(offender.nomisRecord.releaseDate), 'dd MMM yyyy')
        : null

      const variationRequestDate = licence.dateCreated
        ? format(parseCvlDateTime(licence.dateCreated, { withSeconds: false }), 'dd MMMM yyyy')
        : null

      return {
        licenceId: licence.licenceId,
        name: convertToTitleCase(`${offender.nomisRecord.firstName} ${offender.nomisRecord.lastName}`.trim()),
        crnNumber: offender.deliusRecord.otherIds.crn,
        licenceType: <LicenceType>licence.licenceType,
        variationRequestDate,
        releaseDate,
        // transient
        comUsername: licence.comUsername,
        deliusRecord: offender.deliusRecord,
      }
    })
  }

  private async mapResponsibleComsToCases(search: string, caseload: ManagedCase[]): Promise<VaryApprovalCase[]> {
    const comUsernames = caseload.map(offender => offender.comUsername).filter(comUsername => comUsername)

    const coms = await this.communityService.getStaffDetailsByUsernameList(comUsernames)

    return caseload
      .map(({ comUsername, deliusRecord, ...offender }) => {
        const responsibleCom = coms.find(com => com.username?.toLowerCase() === comUsername?.toLowerCase())

        if (responsibleCom) {
          return {
            ...offender,
            probationPractitioner: {
              staffCode: responsibleCom.staffCode,
              name: `${responsibleCom.staff.forenames} ${responsibleCom.staff.surname}`.trim(),
            },
          }
        }

        if (!deliusRecord.staff || deliusRecord.staff.unallocated) {
          return {
            ...offender,
            probationPractitioner: undefined,
          }
        }

        return {
          ...offender,
          probationPractitioner: {
            staffCode: deliusRecord.staff.code,
            name: `${deliusRecord.staff.forenames} ${deliusRecord.staff.surname}`.trim(),
          },
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
