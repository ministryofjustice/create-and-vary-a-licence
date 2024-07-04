import { startOfDay, add, endOfDay, format, getUnixTime } from 'date-fns'
import CommunityService from '../communityService'
import PrisonerService from '../prisonerService'
import LicenceService from '../licenceService'
import { DeliusRecord, Licence, ProbationPractitioner } from '../../@types/managedCase'
import LicenceStatus from '../../enumeration/licenceStatus'
import { User } from '../../@types/CvlUserDetails'
import type { LicenceSummary, CaseloadItem, CvlPrisoner, CvlFields } from '../../@types/licenceApiClientTypes'
import LicenceKind from '../../enumeration/LicenceKind'
import {
  CaViewCasesTab,
  convertToTitleCase,
  determineCaViewCasesTab,
  groupingBy,
  parseCvlDate,
  parseIsoDate,
} from '../../utils/utils'
import CaseListUtils from './caselistUtils'

export type CaCaseLoad = {
  cases: CaCase[]
  showAttentionNeededTab: boolean
}

export type GroupedByCom = {
  staffCode: CaCase[]
  staffUsername: CaCase[]
  noComId: CaCase[]
}

export type CaCase = {
  kind?: LicenceKind
  licenceId?: number
  licenceVersionOf?: number
  name: string
  prisonerNumber: string
  probationPractitioner?: ProbationPractitioner
  releaseDate: string
  releaseDateLabel: string
  licenceStatus: LicenceStatus
  tabType?: CaViewCasesTab
  nomisLegalStatus?:
    | 'RECALL'
    | 'DEAD'
    | 'INDETERMINATE_SENTENCE'
    | 'SENTENCED'
    | 'CONVICTED_UNSENTENCED'
    | 'CIVIL_PRISONER'
    | 'IMMIGRATION_DETAINEE'
    | 'REMAND'
    | 'UNKNOWN'
    | 'OTHER'
  lastWorkedOnBy?: string
  isDueForEarlyRelease?: boolean
  isInHardStopPeriod?: boolean
}

export type ManagedCase = {
  deliusRecord?: DeliusRecord
  nomisRecord?: CvlPrisoner
  licences?: Licence[]
  probationPractitioner?: ProbationPractitioner
  cvlFields: CvlFields
}

export default class CaCaseloadService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly communityService: CommunityService,
    private readonly licenceService: LicenceService
  ) {}

  public async getPrisonOmuCaseload(user: User, prisonCaseload: string[], searchString?: string): Promise<CaCaseLoad> {
    const existingLicences = await this.licenceService.getPreReleaseLicencesForOmu(user, prisonCaseload)
    const eligibleExistingLicences = await this.filterAndFormatExistingLicences(existingLicences, user)

    const eligibleNotStartedLicences = await this.findAndFormatNotStartedLicences(
      existingLicences,
      prisonCaseload,
      user
    )

    if (!eligibleExistingLicences.length && !eligibleNotStartedLicences.length) {
      return { cases: [], showAttentionNeededTab: false }
    }

    const cases = await this.mapCasesToComs(eligibleExistingLicences.concat(eligibleNotStartedLicences))

    return this.buildCaseload(cases, searchString, 'prison')
  }

  public async getProbationOmuCaseload(
    user: User,
    prisonCaseload: string[],
    searchString?: string
  ): Promise<CaCaseLoad> {
    const licences = await this.licenceService.getPostReleaseLicencesForOmu(user, prisonCaseload)

    if (!licences.length) {
      return { cases: [], showAttentionNeededTab: false }
    }

    const formattedLicences = this.formatReleasedLicences(licences)
    const cases = await this.mapCasesToComs(formattedLicences)

    return this.buildCaseload(cases, searchString, 'probation')
  }

  private async filterAndFormatExistingLicences(licences: LicenceSummary[], user: User): Promise<CaCase[]> {
    if (!licences.length) {
      return []
    }

    const licenceNomisIds = licences.map(l => l.nomisId)
    const prisonersWithLicences = await this.licenceService.searchPrisonersByNomsIds(licenceNomisIds, user)
    const nomisEnrichedLicences = this.enrichWithNomisData(licences, prisonersWithLicences)
    return this.filterExistingLicencesForEligibility(nomisEnrichedLicences)
  }

  private async findAndFormatNotStartedLicences(
    licences: LicenceSummary[],
    prisonCaseload: string[],
    user: User
  ): Promise<CaCase[]> {
    const licenceNomisIds = licences.map(l => l.nomisId)
    const prisonersApproachingRelease = await this.getPrisonersApproachingRelease(user, prisonCaseload)

    if (!prisonersApproachingRelease.length) {
      return []
    }

    const prisonersWithoutLicences = prisonersApproachingRelease.filter(
      p => !licenceNomisIds.includes(p.prisoner.prisonerNumber)
    )

    if (!prisonersWithoutLicences.length) {
      return []
    }

    const eligiblePrisoners = await this.filterOffendersEligibleForLicence(prisonersWithoutLicences, user)
    const casesWithoutLicences = await this.pairNomisRecordsWithDelius(eligiblePrisoners)
    return this.createNotStartedLicenceForCase(casesWithoutLicences)
  }

  private enrichWithNomisData(licences: LicenceSummary[], prisoners: CaseloadItem[]): CaCase[] {
    return prisoners
      .map(p => {
        const licencesForOffender = licences.filter(l => l.nomisId === p.prisoner.prisonerNumber)
        const licence = this.findLatestLicenceSummary(licencesForOffender)
        const releaseDate = parseCvlDate(licence.actualReleaseDate || licence.conditionalReleaseDate)
        return {
          kind: <LicenceKind>licence.kind,
          licenceId: licence.licenceId,
          licenceVersionOf: licence.versionOf,
          name: convertToTitleCase(`${licence.forename} ${licence.surname}`.trim()),
          prisonerNumber: licence.nomisId,
          releaseDate: releaseDate ? format(releaseDate, 'dd MMM yyyy') : 'not found',
          releaseDateLabel: licence.actualReleaseDate ? 'Confirmed release date' : 'CRD',
          licenceStatus: <LicenceStatus>licence.licenceStatus,
          nomisLegalStatus: p.prisoner.legalStatus,
          lastWorkedOnBy: licence.updatedByFullName,
          isDueForEarlyRelease: licence.isDueForEarlyRelease,
          isInHardStopPeriod: licence.isInHardStopPeriod,
          tabType: determineCaViewCasesTab(p.prisoner, p.cvl, licence),
          probationPractitioner: {
            staffUsername: licence.comUsername,
          },
        }
      })
      .filter(c => c)
  }

  private createNotStartedLicenceForCase(cases: ManagedCase[]): CaCase[] {
    return cases.map(c => {
      // Default status (if not overridden below) will show the case as clickable on case lists
      let licenceStatus = LicenceStatus.NOT_STARTED

      if (CaseListUtils.isBreachOfTopUpSupervision(c)) {
        // Imprisonment status indicates a breach of top up supervision order - not clickable (yet)
        licenceStatus = LicenceStatus.OOS_BOTUS
      } else if (CaseListUtils.isRecall(c)) {
        // Offender is subject to an active recall - not clickable
        licenceStatus = LicenceStatus.OOS_RECALL
      } else if (c.cvlFields.isInHardStopPeriod) {
        licenceStatus = LicenceStatus.TIMED_OUT
      }

      const com = c.deliusRecord.staff

      if (!c.nomisRecord.conditionalReleaseDate) {
        return {
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          releaseDate: null,
          releaseDateLabel: c.nomisRecord.confirmedReleaseDate ? 'Confirmed release date' : 'CRD',
          licenceStatus: <LicenceStatus>licenceStatus,
          nomisLegalStatus: c.nomisRecord.legalStatus,
          isDueForEarlyRelease: c.cvlFields.isDueForEarlyRelease,
          isInHardStopPeriod: c.cvlFields.isInHardStopPeriod,
          tabType: determineCaViewCasesTab(c.nomisRecord, c.cvlFields),
          probationPractitioner: {
            staffCode: com.code,
            name: `${com.forenames} ${com.surname}`.trim(),
          },
        }
      }

      const releaseDate = parseIsoDate(c.nomisRecord.confirmedReleaseDate || c.nomisRecord.conditionalReleaseDate)

      return {
        name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
        prisonerNumber: c.nomisRecord.prisonerNumber,
        releaseDate: format(releaseDate, 'dd MMM yyyy'),
        releaseDateLabel: c.nomisRecord.confirmedReleaseDate ? 'Confirmed release date' : 'CRD',
        licenceStatus: <LicenceStatus>licenceStatus,
        nomisLegalStatus: c.nomisRecord.legalStatus,
        isDueForEarlyRelease: c.cvlFields.isDueForEarlyRelease,
        isInHardStopPeriod: c.cvlFields.isInHardStopPeriod,
        tabType: determineCaViewCasesTab(c.nomisRecord, c.cvlFields),
        probationPractitioner: {
          staffCode: com.code,
          name: `${com.forenames} ${com.surname}`.trim(),
        },
      }
    })
  }

  private formatReleasedLicences = (licences: LicenceSummary[]): CaCase[] => {
    const groupedLicences = groupingBy(licences, 'nomisId')
    return groupedLicences.map(licences => {
      const licence = licences.length > 1 ? licences.find(l => l.licenceStatus !== LicenceStatus.ACTIVE) : licences[0]
      const releaseDate = parseCvlDate(licence.actualReleaseDate || licence.conditionalReleaseDate)
      return {
        kind: <LicenceKind>licence.kind,
        licenceId: licence.licenceId,
        licenceVersionOf: licence.versionOf,
        name: convertToTitleCase(`${licence.forename} ${licence.surname}`.trim()),
        prisonerNumber: licence.nomisId,
        releaseDate: releaseDate ? format(releaseDate, 'dd MMM yyyy') : 'not found',
        releaseDateLabel: licence.actualReleaseDate ? 'Confirmed release date' : 'CRD',
        licenceStatus: <LicenceStatus>licence.licenceStatus,
        lastWorkedOnBy: licence.updatedByFullName,
        isDueForEarlyRelease: licence.isDueForEarlyRelease,
        isInHardStopPeriod: licence.isInHardStopPeriod,
        probationPractitioner: {
          staffUsername: licence.comUsername,
        },
      }
    })
  }

  private pairNomisRecordsWithDelius = async (prisoners: Array<CaseloadItem>): Promise<Array<ManagedCase>> => {
    const caseloadNomisIds = prisoners
      .filter(({ prisoner }) => prisoner.prisonerNumber)
      .map(({ prisoner }) => prisoner.prisonerNumber)

    if (!caseloadNomisIds.length) {
      return []
    }

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

  private filterOffendersEligibleForLicence = async (
    offenders: Array<CaseloadItem>,
    user?: User
  ): Promise<CaseloadItem[]> => {
    const eligibleOffenders = offenders
      .filter(offender => !CaseListUtils.isParoleEligible(offender.prisoner.paroleEligibilityDate))
      .filter(offender => offender.prisoner.legalStatus !== 'DEAD')
      .filter(offender => !offender.prisoner.indeterminateSentence)
      .filter(offender => offender.prisoner.conditionalReleaseDate)
      .filter(offender =>
        CaseListUtils.isEligibleEDS(
          offender.prisoner.paroleEligibilityDate,
          offender.prisoner.conditionalReleaseDate,
          offender.prisoner.confirmedReleaseDate,
          offender.prisoner.actualParoleDate
        )
      )

    if (!eligibleOffenders.length) return eligibleOffenders

    const hdcStatuses = await this.prisonerService.getHdcStatuses(
      eligibleOffenders.map(c => c.prisoner),
      user
    )

    return eligibleOffenders.filter(offender => {
      const hdcRecord = hdcStatuses.find(hdc => hdc.bookingId === offender.prisoner.bookingId)
      return (
        !hdcRecord || hdcRecord.approvalStatus !== 'APPROVED' || !offender.prisoner.homeDetentionCurfewEligibilityDate
      )
    })
  }

  private filterExistingLicencesForEligibility = (licences: CaCase[]): CaCase[] => {
    return licences.filter(l => l.nomisLegalStatus !== 'DEAD')
  }

  private async mapCasesToComs(cases: CaCase[]): Promise<CaCase[]> {
    const splitCases = this.splitCasesByComDetails(cases)

    const noComPrisonerNumbers = splitCases.noComId.map(c => c.prisonerNumber)
    const deliusRecords = await this.communityService.getOffendersByNomsNumbers(noComPrisonerNumbers)

    const caCaseList: CaCase[] = []

    // if no code or username, hit delius to find COM details
    caCaseList.push(
      ...splitCases.noComId.map(c => {
        const com = deliusRecords
          .find(d => d.otherIds.nomsNumber === c.prisonerNumber)
          .offenderManagers.find(om => om.active)?.staff
        if (com && !com.unallocated) {
          return {
            ...c,
            probationPractitioner: {
              staffCode: com.code,
              name: `${com.forenames} ${com.surname}`.trim(),
            },
          }
        }

        return c
      })
    )

    // If COM username but no code, do a separate call to use the data in CVL if it exists. Should help highlight any desync between Delius and CVL
    const comUsernames = splitCases.staffUsername.map(c => c.probationPractitioner.staffUsername)
    const coms = await this.communityService.getStaffDetailsByUsernameList(comUsernames)

    caCaseList.push(
      ...splitCases.staffUsername.map(c => {
        const com = coms.find(com => com.username.toLowerCase() === c.probationPractitioner.staffUsername.toLowerCase())
        if (com) {
          return {
            ...c,
            probationPractitioner: {
              staffCode: com.staffCode,
              name: `${com.staff.forenames} ${com.staff.surname}`.trim(),
            },
          }
        }
        return c
      })
    )

    // If already have COM code and name, no extra calls required
    caCaseList.push(
      ...splitCases.staffCode.map(c => {
        return {
          ...c,
          probationPractitioner: {
            staffCode: c.probationPractitioner.staffCode,
            name: c.probationPractitioner.name,
          },
        }
      })
    )

    return caCaseList
  }

  private async getPrisonersApproachingRelease(user: User, prisonCaseload: string[]): Promise<CaseloadItem[]> {
    const today = startOfDay(new Date())
    const todayPlusFourWeeks = endOfDay(add(new Date(), { weeks: 4 }))

    return this.licenceService.searchPrisonersByReleaseDate(today, todayPlusFourWeeks, prisonCaseload, user)
  }

  private buildCaseload(cases: CaCase[], searchString: string, view: 'prison' | 'probation'): CaCaseLoad {
    const showAttentionNeededTab = cases.some(e => e.tabType === CaViewCasesTab.ATTENTION_NEEDED)
    const searchResults = this.applySearch(searchString, cases)
    const sortResults = this.applySort(searchResults, view)
    return { cases: sortResults, showAttentionNeededTab }
  }

  findLatestLicenceSummary(licences: LicenceSummary[]): LicenceSummary {
    if (licences.length === 1) {
      return licences[0]
    }
    if (licences.find(l => l.licenceStatus === LicenceStatus.TIMED_OUT)) {
      return licences.find(l => l.licenceStatus !== LicenceStatus.TIMED_OUT)
    }

    return licences.find(
      l => l.licenceStatus === LicenceStatus.SUBMITTED || l.licenceStatus === LicenceStatus.IN_PROGRESS
    )
  }

  applySearch(searchString: string, cases: CaCase[]): CaCase[] {
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

  applySort(cases: CaCase[], view: 'prison' | 'probation'): CaCase[] {
    return cases.sort((a, b) => {
      const crd1 = getUnixTime(new Date(a.releaseDate))
      const crd2 = getUnixTime(new Date(b.releaseDate))
      return view === 'prison' ? crd1 - crd2 : crd2 - crd1
    })
  }

  splitCasesByComDetails(cases: CaCase[]) {
    const groupedCases = cases.reduce((acc, c) => {
      const groups = acc
      if (!groups.staffCode) {
        groups.staffCode = []
      }
      if (!groups.staffUsername) {
        groups.staffUsername = []
      }
      if (!groups.noComId) {
        groups.noComId = []
      }

      if (c.probationPractitioner.staffCode) {
        groups.staffCode.push(c)
      } else if (c.probationPractitioner.staffUsername) {
        groups.staffUsername.push(c)
      } else {
        groups.noComId.push(c)
      }

      return groups
    }, {} as GroupedByCom)
    return groupedCases
  }
}
