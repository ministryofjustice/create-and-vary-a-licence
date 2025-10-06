import _ from 'lodash'
import { format } from 'date-fns'
import moment from 'moment/moment'
import ProbationService from '../probationService'
import LicenceService from '../licenceService'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { User } from '../../@types/CvlUserDetails'
import type { CvlPrisoner, LicenceSummary, VaryApproverCase } from '../../@types/licenceApiClientTypes'
import LicenceKind from '../../enumeration/LicenceKind'
import { convertToTitleCase, parseCvlDate, parseCvlDateTime } from '../../utils/utils'
import { nameToString } from '../../data/deliusClient'
import { DeliusRecord } from '../../@types/deliusClientTypes'
import { LicenceApiClient } from '../../data'

type Licence = {
  id?: number
  status: LicenceStatus
  kind?: LicenceKind
  type: LicenceType
  crn?: string
  nomisId?: string
  name?: string
  comUsername?: string
  dateCreated?: string
  approvedBy?: string
  approvedDate?: string
  versionOf?: number
  updatedByFullName?: string
  hardStopWarningDate?: Date
  hardStopDate?: Date
  licenceStartDate?: string
  releaseDate: Date
  isDueToBeReleasedInTheNextTwoWorkingDays: boolean
}

type AcoCase = {
  deliusRecord?: DeliusRecord
  nomisRecord?: CvlPrisoner
  licences?: Licence[]
  probationPractitioner?: string
}

export default class VaryApproverCaseloadService {
  constructor(
    private readonly probationService: ProbationService,
    private readonly licenceApiClient: LicenceApiClient,
    private readonly licenceService: LicenceService,
  ) {}

  async getVaryApproverCaseload(
    user: User,
    searchTerm: string,
    getAcoCaseloadFromBackEnd: boolean,
  ): Promise<VaryApproverCase[]> {
    if (getAcoCaseloadFromBackEnd) {
      return (
        await this.licenceApiClient.getVaryApproverCaseload({
          probationPduCodes: user.probationPduCodes,
          searchTerm,
        })
      ).map(this.mapToCaseView)
    }
    return this.licenceService
      .getLicencesForVariationApproval(user)
      .then(licences => this.mapLicencesToOffenders(licences))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
      .then(caseload => caseload.map(this.mapAcoCaseToView))
      .then(caseload => caseload.filter(acoCase => this.applySearchFilter(acoCase, searchTerm)))
      .then(caseload => caseload.sort((a, b) => this.sortByReleaseDate(a, b)))
  }

  async getVaryApproverCaseloadByRegion(
    user: User,
    searchTerm: string,
    getAcoCaseloadFromBackEnd: boolean,
  ): Promise<VaryApproverCase[]> {
    if (getAcoCaseloadFromBackEnd) {
      return (
        await this.licenceApiClient.getVaryApproverCaseload({
          probationAreaCode: user.probationAreaCode,
          searchTerm,
        })
      ).map(this.mapToCaseView)
    }

    return this.licenceService
      .getLicencesForVariationApprovalByRegion(user)
      .then(licences => this.mapLicencesToOffenders(licences))
      .then(caseload => this.mapResponsibleComsToCases(caseload))
      .then(caseload => caseload.map(this.mapAcoCaseToView))
      .then(caseload => caseload.filter(acoCase => this.applySearchFilter(acoCase, searchTerm)))
      .then(caseload => caseload.sort((a, b) => this.sortByReleaseDate(a, b)))
  }

  private pairDeliusRecordsWithNomis = async (managedOffenders: DeliusRecord[], user: User): Promise<AcoCase[]> => {
    const caseloadNomisIds = managedOffenders.filter(offender => offender.nomisId).map(offender => offender.nomisId)

    const nomisRecords = await this.licenceService.searchPrisonersByNomsIds(caseloadNomisIds, user)

    return managedOffenders
      .map(offender => {
        const { prisoner } = nomisRecords.find(({ prisoner }) => prisoner.prisonerNumber === offender.nomisId) || {}
        return {
          deliusRecord: offender,
          nomisRecord: prisoner,
        }
      })
      .filter(offender => offender.nomisRecord, 'unable to find prison record')
  }

  private mapLicencesToOffenders = async (licences: LicenceSummary[], user?: User): Promise<AcoCase[]> => {
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

  private async mapResponsibleComsToCases(caseload: AcoCase[]): Promise<AcoCase[]> {
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
          probationPractitioner: nameToString(responsibleCom.name),
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
        probationPractitioner: nameToString(com.name),
      }
    })
  }

  private mapAcoCaseToView(acoCase: AcoCase): VaryApproverCase {
    const licence = _.head(acoCase.licences)

    const releaseDate = licence.licenceStartDate ? format(parseCvlDate(licence.licenceStartDate), 'dd MMM yyyy') : null
    const variationRequestDate = licence.dateCreated
      ? format(parseCvlDateTime(licence.dateCreated, { withSeconds: false }), 'dd MMM yyyy')
      : null

    return {
      licenceId: licence.id,
      name: convertToTitleCase(`${acoCase.nomisRecord.firstName} ${acoCase.nomisRecord.lastName}`.trim()),
      crnNumber: acoCase.deliusRecord.crn,
      licenceType: licence.type,
      variationRequestDate,
      releaseDate,
      probationPractitioner: acoCase.probationPractitioner,
    }
  }

  private applySearchFilter(acoCase: VaryApproverCase, search: string): boolean {
    const searchString = search?.toLowerCase().trim()
    if (!searchString) return true
    return (
      acoCase.crnNumber?.toLowerCase().includes(searchString) ||
      acoCase.name.toLowerCase().includes(searchString) ||
      acoCase.probationPractitioner.toLowerCase().includes(searchString)
    )
  }

  private sortByReleaseDate(a: VaryApproverCase, b: VaryApproverCase): number {
    const releaseDate1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
    const releaseDate2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
    return releaseDate1 - releaseDate2
  }

  private mapToCaseView(aCase: VaryApproverCase) {
    return {
      ...aCase,
      releaseDate: format(parseCvlDate(aCase.releaseDate), 'dd MMM yyyy'),
      variationRequestDate: format(parseCvlDate(aCase.variationRequestDate), 'dd MMM yyyy'),
    }
  }
}
