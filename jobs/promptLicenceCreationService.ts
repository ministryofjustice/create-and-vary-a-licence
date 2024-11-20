import { add, endOfISOWeek, startOfISOWeek, subDays } from 'date-fns'

import _ from 'lodash'
import config from '../server/config'
import LicenceStatus from '../server/enumeration/licenceStatus'
import { EmailContact } from '../server/@types/licenceApiClientTypes'
import { convertToTitleCase } from '../server/utils/utils'
import logger from '../logger'
import { LicenceApiClient } from '../server/data'
import PromptListService, { type PromptCase } from '../server/services/lists/promptListService'

export default class PromptLicenceCreationService {
  constructor(
    private readonly promptListService: PromptListService,
    private readonly licenceApiClient: LicenceApiClient,
  ) {}

  buildEmailGroups(urgentPromptCases: PromptCase[], initialPromptCases: PromptCase[]): EmailContact[] {
    const managedCases = [...urgentPromptCases, ...initialPromptCases]

    const mapPrisonerToReleaseCase = (prisoner: PromptCase) => {
      return {
        name: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
        crn: prisoner.crn,
        releaseDate: prisoner.releaseDate,
      }
    }

    const prisonersWithCom = managedCases
      .map(prisoner => {
        if (!config.rollout.probationAreas.includes(prisoner.comProbationAreaCode)) {
          return null
        }

        return {
          prisoner,
          email: prisoner.comEmail,
          comName: `${prisoner.comName}`,
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
            .filter(p => initialPromptCases.find(ipc => ipc.prisonerNumber === p.prisonerNumber))
            .map(prisoner => mapPrisonerToReleaseCase(prisoner)),
          urgentPromptCases: prisoners
            .filter(p => urgentPromptCases.find(upc => upc.prisonerNumber === p.prisonerNumber))
            .map(prisoner => mapPrisonerToReleaseCase(prisoner)),
          comName,
          email,
        }
      })
      .value()
  }

  private excludeCasesNotAssignedToPpWithinPast7Days = (caseload: PromptCase[]): PromptCase[] => {
    const startOf7Days = subDays(new Date(), 7)
    const endOf7Days = new Date()
    const isWithinPast7Days = (c: PromptCase) => {
      if (c.comAllocationDate) {
        const dateAllocatedToPp = new Date(c.comAllocationDate)
        return dateAllocatedToPp >= startOf7Days && dateAllocatedToPp < endOf7Days
      }
      return false
    }

    return caseload.filter(isWithinPast7Days)
  }

  /* eslint-disable */
  private notifyComOfUpcomingReleases = async (emailGroups: EmailContact[]) => {
    if (emailGroups.length === 0) return
    const workList = _.chunk(emailGroups, 30)

    for (const probationOfficers of workList) {
      const groups = probationOfficers.filter(e => e.initialPromptCases.length || e.urgentPromptCases.length)
      if (groups.length) {
        await this.notifyComsToPromptLicenceCreation(groups)
      }
    }
  }

  private async notifyComsToPromptLicenceCreation(emailGroups: EmailContact[]): Promise<void> {
    const casesCount = emailGroups.reduce(
      (acc, e) => acc + (e.initialPromptCases?.length || 0) + (e.urgentPromptCases?.length || 0),
      0
    )
    logger.info(`Prompting ${emailGroups.length} contacts about ${casesCount} cases for licence creation`)
    await this.licenceApiClient.notifyComsToPromptEmailCreation(emailGroups)
  }

  public async gatherGroups(): Promise<EmailContact[]> {
    const [urgentPromptCases, week13InitialPromptCases, week5to12InitialPromptCases] = await Promise.all([
      this.promptListService
        .getListForDates(startOfISOWeek(new Date()), endOfISOWeek(add(new Date(), { weeks: 3 })), [
          LicenceStatus.NOT_STARTED,
          LicenceStatus.IN_PROGRESS,
        ])
        .then(caseload => {
          logger.info(`urgentPromptCases: ${caseload.length}`)
          return caseload
        }),

      this.promptListService
        .getListForDates(startOfISOWeek(add(new Date(), { weeks: 4 })), endOfISOWeek(add(new Date(), { weeks: 11 })), [
          LicenceStatus.NOT_STARTED,
        ])
        .then(caseload => {
          logger.info(`week13InitialPromptCases - before filter: ${caseload.length}`)
          const result = this.excludeCasesNotAssignedToPpWithinPast7Days(caseload)
          logger.info(`week13InitialPromptCases - after filter: ${result.length}`)
          return result
        }),

      this.promptListService
        .getListForDates(startOfISOWeek(add(new Date(), { weeks: 12 })), endOfISOWeek(add(new Date(), { weeks: 12 })), [
          LicenceStatus.NOT_STARTED,
        ])
        .then(caseload => {
          logger.info(`week5to12InitialPromptCases: ${caseload.length}`)
          return caseload
        }),
    ])

    return this.buildEmailGroups(urgentPromptCases, [...week13InitialPromptCases, ...week5to12InitialPromptCases])
  }

  run = async () => {
    const emailGroups = await this.gatherGroups()
    await this.notifyComOfUpcomingReleases(emailGroups)
  }
}
