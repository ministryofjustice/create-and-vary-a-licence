import { add, endOfISOWeek, startOfISOWeek, subDays } from 'date-fns'

import _ from 'lodash'
import config from '../server/config'
import Container from '../server/services/container'
import { ManagedCase } from '../server/@types/managedCase'
import LicenceStatus from '../server/enumeration/licenceStatus'
import CaseloadService from '../server/services/caseloadService'
import LicenceService from '../server/services/licenceService'
import { CvlPrisoner, EmailContact } from '../server/@types/licenceApiClientTypes'
import { convertToTitleCase } from '../server/utils/utils'
import CommunityService from '../server/services/communityService'
import logger from '../logger'
import { LicenceApiClient } from '../server/data'

export default class PromptLicenceCreationService {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly caseloadService: CaseloadService,
    private readonly communityService: CommunityService,
    private readonly licenceApiClient: LicenceApiClient
  ) {}

  pollPrisonersDueForLicence = async (
    earliestReleaseDate: Date,
    latestReleaseDate: Date,
    licenceStatus: LicenceStatus[]
  ): Promise<ManagedCase[]> => {
    const prisonCodes = config.rollout.prisons

    return this.licenceService
      .searchPrisonersByReleaseDate(earliestReleaseDate, latestReleaseDate, prisonCodes)
      .then(prisoners => prisoners.filter(({ prisoner }) => prisoner?.status.startsWith('ACTIVE')))
      .then(caseload => new Container(caseload))
      .then(caseload => this.caseloadService.pairNomisRecordsWithDelius(caseload))
      .then(caseload => this.caseloadService.filterOffendersEligibleForLicence(caseload))
      .then(prisoners => this.caseloadService.mapOffendersToLicences(prisoners))
      .then(caseload => caseload.unwrap())
      .then(prisoners =>
        prisoners.filter(offender => licenceStatus.some(status => offender.licences.find(l => l.status === status)))
      )
  }

  buildEmailGroups = async (
    urgentPromptCases: ManagedCase[],
    initialPromptCases: ManagedCase[]
  ): Promise<EmailContact[]> => {
    const managedCases = [...urgentPromptCases, ...initialPromptCases]

    const mapPrisonerToReleaseCase = (prisoner: CvlPrisoner) => {
      return {
        name: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
        crn: undefined as string, // FIXME - this is never worked!
        releaseDate: prisoner.confirmedReleaseDate || prisoner.conditionalReleaseDate,
      }
    }

    const staffCodes = _.uniq(
      managedCases.map(prisoner => prisoner.deliusRecord.offenderManagers.find(manager => manager.active)?.staff.code)
    )

    const staffDetails = []
    /* eslint-disable */
    for (const codes of _.chunk(staffCodes, 500)) {
      const partResult = await this.communityService.getStaffDetailByStaffCodeList(codes)
      staffDetails.push(partResult)
    }
    /* eslint-enable */

    const staff = staffDetails.flat()
    const prisonersWithCom = managedCases
      .map(prisoner => {
        const responsibleComStaffCode = prisoner.deliusRecord.offenderManagers.find(manager => manager.active)?.staff
          .code
        const responsibleCom = staff.find(com => com.staffCode && com.staffCode === responsibleComStaffCode)

        if (!config.rollout.probationAreas.includes(responsibleCom.probationArea.code)) {
          return null
        }
        const prisonerWithCRN = { ...prisoner.nomisRecord, crn: prisoner.deliusRecord.offenderCrn }

        return {
          prisoner: prisonerWithCRN,
          email: responsibleCom.email,
          comName: `${responsibleCom.staff.forenames} ${responsibleCom.staff.surname}`,
        }
      })
      .filter(prisoner => prisoner)

    return _.chain(prisonersWithCom)
      .groupBy('email')
      .map((emailGroup, email) => {
        const prisoners = emailGroup.map(managedOffender => managedOffender.prisoner)
        const comName = emailGroup.map(managedOffender => managedOffender.comName).pop()

        return {
          initialPromptCases: prisoners
            .filter(p => initialPromptCases.find(ipc => _.isEqual(ipc.nomisRecord, p)))
            .map(prisoner => mapPrisonerToReleaseCase(prisoner)),
          urgentPromptCases: prisoners
            .filter(p => urgentPromptCases.find(upc => _.isEqual(upc.nomisRecord, p)))
            .map(prisoner => mapPrisonerToReleaseCase(prisoner)),
          comName,
          email,
        }
      })
      .value()
  }

  excludeCasesNotAssignedToPpWithinPast7Days = (caseload: ManagedCase[]): ManagedCase[] => {
    const startOf7Days = subDays(new Date(), 7)
    const endOf7Days = new Date()
    const isWithinPast7Days = (c: ManagedCase) => {
      if (c.deliusRecord.offenderManagers) {
        const dateAllocatedToPp = new Date(c.deliusRecord.offenderManagers.find(om => om.active).fromDate)
        return dateAllocatedToPp >= startOf7Days && dateAllocatedToPp < endOf7Days
      }
      return false
    }

    return caseload.filter(isWithinPast7Days)
  }

  /* eslint-disable */
  notifyComOfUpcomingReleases = async (emailGroups: EmailContact[]) => {
    if (emailGroups.length === 0) return
    const workList = _.chunk(emailGroups, 30)

    for (const probationOfficers of workList) {
      await this.notifyComsToPromptLicenceCreation(probationOfficers)
    }
  }

  async notifyComsToPromptLicenceCreation(emailGroups: EmailContact[]): Promise<void> {
    const groups = emailGroups.filter(e => e.initialPromptCases.length || e.urgentPromptCases.length)
    if (groups.length) {
      const casesCount = emailGroups.reduce(
        (acc, e) => acc + (e.initialPromptCases?.length || 0) + (e.urgentPromptCases?.length || 0),
        0
      )
      logger.info(`Prompting ${emailGroups.length} contacts about ${casesCount} cases for licence creation`)
      await this.licenceApiClient.notifyComsToPromptEmailCreation(emailGroups)
    }
  }
  /* eslint-enable */

  run = async () => {
    const [urgentPromptCases, week13InitialPromptCases, week5to12InitialPromptCases] = await Promise.all([
      this.pollPrisonersDueForLicence(startOfISOWeek(new Date()), endOfISOWeek(add(new Date(), { weeks: 3 })), [
        LicenceStatus.NOT_STARTED,
        LicenceStatus.IN_PROGRESS,
      ]).then(caseload => {
        logger.info(`urgentPromptCases: ${caseload.length}`)
        return caseload
      }),

      this.pollPrisonersDueForLicence(
        startOfISOWeek(add(new Date(), { weeks: 4 })),
        endOfISOWeek(add(new Date(), { weeks: 11 })),
        [LicenceStatus.NOT_STARTED]
      ).then(caseload => {
        logger.info(`week13InitialPromptCases - before filter: ${caseload.length}`)
        const result = this.excludeCasesNotAssignedToPpWithinPast7Days(caseload)
        logger.info(`week13InitialPromptCases - after filter: ${result.length}`)
        return result
      }),

      this.pollPrisonersDueForLicence(
        startOfISOWeek(add(new Date(), { weeks: 12 })),
        endOfISOWeek(add(new Date(), { weeks: 12 })),
        [LicenceStatus.NOT_STARTED]
      ).then(caseload => {
        logger.info(`week5to12InitialPromptCases: ${caseload.length}`)
        return caseload
      }),
    ])

    const emailGroups = await this.buildEmailGroups(urgentPromptCases, [
      ...week13InitialPromptCases,
      ...week5to12InitialPromptCases,
    ])

    await this.notifyComOfUpcomingReleases(emailGroups)
  }
}
