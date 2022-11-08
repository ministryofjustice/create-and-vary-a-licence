import 'reflect-metadata'
import _ from 'lodash'
import { add, subDays, startOfISOWeek, endOfISOWeek } from 'date-fns'
import { buildAppInsightsClient, flush, initialiseAppInsights } from '../server/utils/azureAppInsights'
import logger from '../logger'
import { Prisoner } from '../server/@types/prisonerSearchApiClientTypes'
import config from '../server/config'
import { services } from '../server/services'
import { ManagedCase } from '../server/@types/managedCase'
import LicenceStatus from '../server/enumeration/licenceStatus'
import { EmailContact } from '../server/@types/licenceApiClientTypes'
import { convertToTitleCase } from '../server/utils/utils'
import Container from '../server/services/container'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-prompt-licence-create-job')

const { caseloadService, prisonerService, communityService, licenceService } = services

const pollPrisonersDueForLicence = async (
  earliestReleaseDate: Date,
  latestReleaseDate: Date,
  licenceStatus: LicenceStatus[]
): Promise<ManagedCase[]> => {
  const prisonCodes = config.rollout.prisons

  return prisonerService
    .searchPrisonersByReleaseDate(earliestReleaseDate, latestReleaseDate, prisonCodes)
    .then(prisoners => prisoners.filter(offender => offender.status && offender.status.startsWith('ACTIVE')))
    .then(caseload => new Container(caseload))
    .then(caseload => caseloadService.pairNomisRecordsWithDelius(caseload))
    .then(caseload => caseloadService.filterOffendersEligibleForLicence(caseload))
    .then(prisoners => caseloadService.mapOffendersToLicences(prisoners))
    .then(caseload => caseload.unwrap())
    .then(prisoners =>
      prisoners.filter(offender => licenceStatus.some(status => offender.licences.find(l => l.status === status)))
    )
}

const buildEmailGroups = async (
  initialPromptCases: ManagedCase[],
  urgentPromptCases: ManagedCase[]
): Promise<EmailContact[]> => {
  const managedCases = [...initialPromptCases, ...urgentPromptCases]

  const mapPrisonerToReleaseCase = (prisoner: Prisoner) => {
    return {
      name: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      releaseDate: prisoner.confirmedReleaseDate || prisoner.conditionalReleaseDate,
    }
  }

  const staffCodes = _.uniq(
    managedCases.map(prisoner => prisoner.deliusRecord.offenderManagers.find(manager => manager.active)?.staff.code)
  )

  const staff = await communityService.getStaffDetailByStaffCodeList(staffCodes)

  const prisonersWithCom = managedCases
    .map(prisoner => {
      const responsibleComStaffCode = prisoner.deliusRecord.offenderManagers.find(manager => manager.active)?.staff.code
      const responsibleCom = staff.find(com => com.staffCode && com.staffCode === responsibleComStaffCode)

      if (!config.rollout.probationAreas.includes(responsibleCom.probationArea.code)) {
        return null
      }

      return {
        prisoner: prisoner.nomisRecord,
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

/* eslint-disable */
const notifyComOfUpcomingReleases = async (emailGroups: EmailContact[]) => {
  if (emailGroups.length === 0) return
  const workList = _.chunk(emailGroups, 30)

  for (const probationOfficers of workList) {
    await licenceService.notifyComsToPromptLicenceCreation(probationOfficers)
  }
}
/* eslint-enable */

const excludeCasesNotAssignedToPpWithinPast7Days = (caseload: ManagedCase[]): ManagedCase[] => {
  const previousWeekStart = startOfISOWeek(subDays(new Date(), 7))
  const previousWeekEnd = endOfISOWeek(subDays(new Date(), 7))

  const isWithinPastWeek = (c: ManagedCase) => {
    if (c.deliusRecord.allocationDate) {
      const dateAllocatedToPp = new Date(c.deliusRecord.allocationDate)
      return dateAllocatedToPp >= previousWeekStart && dateAllocatedToPp <= previousWeekEnd
    }
    return false
  }

  return caseload.filter(isWithinPastWeek)
}

Promise.all([
  pollPrisonersDueForLicence(
    startOfISOWeek(add(new Date(), { weeks: 12 })),
    endOfISOWeek(add(new Date(), { weeks: 12 })),
    [LicenceStatus.NOT_STARTED]
  ),

  pollPrisonersDueForLicence(
    startOfISOWeek(add(new Date(), { weeks: 4 })),
    endOfISOWeek(add(new Date(), { weeks: 11 })),
    [LicenceStatus.NOT_STARTED]
  ).then(caseload => excludeCasesNotAssignedToPpWithinPast7Days(caseload)),

  pollPrisonersDueForLicence(startOfISOWeek(new Date()), endOfISOWeek(add(new Date(), { weeks: 3 })), [
    LicenceStatus.NOT_STARTED,
    LicenceStatus.IN_PROGRESS,
  ]),
])
  .then(([week13InitialPromptCases, week5to12InitialPromptCases, urgentPromptCases]) =>
    buildEmailGroups([...week13InitialPromptCases, ...week5to12InitialPromptCases], urgentPromptCases)
  )
  .then(emailGroups => notifyComOfUpcomingReleases(emailGroups))
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while sending emails')
    flush({ callback: () => process.exit() }, 'failure')
  })
