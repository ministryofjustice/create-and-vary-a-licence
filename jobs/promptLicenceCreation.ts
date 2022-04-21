import 'reflect-metadata'
import _ from 'lodash'
import moment, { Moment } from 'moment'
import { buildAppInsightsClient, flush, initialiseAppInsights } from '../server/utils/azureAppInsights'
import logger from '../logger'
import { Prisoner } from '../server/@types/prisonerSearchApiClientTypes'
import config from '../server/config'
import { services } from '../server/services'
import { ManagedCase } from '../server/@types/managedCase'
import LicenceStatus from '../server/enumeration/licenceStatus'
import { EmailContact } from '../server/@types/licenceApiClientTypes'
import { convertToTitleCase } from '../server/utils/utils'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-prompt-licence-create-job')

const { caseloadService, prisonerService, communityService, licenceService } = services

const pollPrisonersDueForLicence = async (
  earliestReleaseDate: Moment,
  latestReleaseDate: Moment
): Promise<ManagedCase[]> => {
  const prisonCodes = config.rollout.prisons

  return prisonerService
    .searchPrisonersByReleaseDate(earliestReleaseDate, latestReleaseDate, prisonCodes)
    .then(prisoners => prisoners.filter(offender => offender.status && offender.status.startsWith('ACTIVE')))
    .then(caseload => caseloadService.pairNomisRecordsWithDelius(caseload))
    .then(caseload => caseloadService.filterOffendersEligibleForLicence(caseload))
    .then(prisoners => caseloadService.mapOffendersToLicences(prisoners))
    .then(prisoners =>
      prisoners.filter(offender =>
        [LicenceStatus.NOT_STARTED, LicenceStatus.IN_PROGRESS].some(status =>
          offender.licences.find(l => l.status === status)
        )
      )
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

const notifyComOfUpcomingReleases = async (emailGroups: EmailContact[]) => {
  if (emailGroups.length > 0) {
    await licenceService.notifyComsToPromptLicenceCreation(emailGroups)
  }
}

Promise.all([
  pollPrisonersDueForLicence(moment().add(12, 'weeks').startOf('isoWeek'), moment().add(12, 'weeks').endOf('isoWeek')),
  pollPrisonersDueForLicence(moment().startOf('isoWeek'), moment().add(3, 'weeks').endOf('isoWeek')),
])
  .then(([initialPromptCases, urgentPromptCases]) => buildEmailGroups(initialPromptCases, urgentPromptCases))
  .then(emailGroups => notifyComOfUpcomingReleases(emailGroups))
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while sending emails')
    flush({ callback: () => process.exit() }, 'failure')
  })
