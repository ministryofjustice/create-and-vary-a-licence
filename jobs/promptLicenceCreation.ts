/* eslint-disable import/first */
/*
 * Do appinsights first to instrument the logger
 */
import 'reflect-metadata'
import _ from 'lodash'
import { add, startOfISOWeek, endOfISOWeek } from 'date-fns'
import { flush, initialiseAppInsights } from '../server/utils/azureAppInsights'
import applicationInfo from '../server/applicationInfo'

initialiseAppInsights(applicationInfo('create-and-vary-a-licence-prompt-licence-create-job'))

import logger from '../logger'
import { Prisoner } from '../server/@types/prisonerSearchApiClientTypes'
import config from '../server/config'
import { services } from '../server/services'
import { ManagedCase } from '../server/@types/managedCase'
import LicenceStatus from '../server/enumeration/licenceStatus'
import { EmailContact } from '../server/@types/licenceApiClientTypes'
import { convertToTitleCase } from '../server/utils/utils'
import PromptLicenceCreationService from './promptLicenceCreationService'

const { caseloadService, prisonerService, communityService, licenceService } = services

const promptLicenceCreationService = new PromptLicenceCreationService(prisonerService, caseloadService)

const buildEmailGroups = async (
  urgentPromptCases: ManagedCase[],
  initialPromptCases: ManagedCase[]
): Promise<EmailContact[]> => {
  const managedCases = [...urgentPromptCases, ...initialPromptCases]

  const mapPrisonerToReleaseCase = (prisoner: Prisoner) => {
    return {
      name: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      crn: prisoner.crn,
      releaseDate: prisoner.confirmedReleaseDate || prisoner.conditionalReleaseDate,
    }
  }

  const staffCodes = _.uniq(
    managedCases.map(prisoner => prisoner.deliusRecord.offenderManagers.find(manager => manager.active)?.staff.code)
  )

  const staffDetails = []
  /* eslint-disable */
  for (const codes of _.chunk(staffCodes, 500)) {
    const partResult = await communityService.getStaffDetailByStaffCodeList(codes)
    staffDetails.push(partResult)
  }
  /* eslint-enable */

  const staff = staffDetails.flat()
  const prisonersWithCom = managedCases
    .map(prisoner => {
      const responsibleComStaffCode = prisoner.deliusRecord.offenderManagers.find(manager => manager.active)?.staff.code
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

/* eslint-disable */
const notifyComOfUpcomingReleases = async (emailGroups: EmailContact[]) => {
  if (emailGroups.length === 0) return
  const workList = _.chunk(emailGroups, 30)

  for (const probationOfficers of workList) {
    await licenceService.notifyComsToPromptLicenceCreation(probationOfficers)
  }
}
/* eslint-enable */

Promise.all([
  promptLicenceCreationService.pollPrisonersDueForLicence(
    startOfISOWeek(new Date()),
    endOfISOWeek(add(new Date(), { weeks: 3 })),
    [LicenceStatus.NOT_STARTED, LicenceStatus.IN_PROGRESS]
  ),

  promptLicenceCreationService
    .pollPrisonersDueForLicence(
      startOfISOWeek(add(new Date(), { weeks: 4 })),
      endOfISOWeek(add(new Date(), { weeks: 11 })),
      [LicenceStatus.NOT_STARTED]
    )
    .then(caseload => promptLicenceCreationService.excludeCasesNotAssignedToPpWithinPast7Days(caseload)),

  promptLicenceCreationService.pollPrisonersDueForLicence(
    startOfISOWeek(add(new Date(), { weeks: 12 })),
    endOfISOWeek(add(new Date(), { weeks: 12 })),
    [LicenceStatus.NOT_STARTED]
  ),
])
  .then(([urgentPromptCases, week13InitialPromptCases, week5to12InitialPromptCases]) =>
    buildEmailGroups(urgentPromptCases, [...week13InitialPromptCases, ...week5to12InitialPromptCases])
  )
  .then(emailGroups => notifyComOfUpcomingReleases(emailGroups))
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while sending emails')
    flush({ callback: () => process.exit(1) }, 'failure')
  })
