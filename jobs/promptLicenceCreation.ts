import 'reflect-metadata'
import moment from 'moment'
import _ from 'lodash'
import { buildAppInsightsClient, flush, initialiseAppInsights } from '../server/utils/azureAppInsights'
import logger from '../logger'
import { Prisoner } from '../server/@types/prisonerSearchApiClientTypes'
import config from '../server/config'
import { services } from '../server/services'
import { ManagedCase } from '../server/@types/managedCase'
import LicenceStatus from '../server/enumeration/licenceStatus'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-prompt-licence-create-job')

type EmailContact = {
  initialPromptCases: Prisoner[]
  urgentPromptCases: Prisoner[]
  email: string
}

const { caseloadService, prisonerService, communityService } = services

const pollPrisonersDueForLicence = async (): Promise<Prisoner[]> => {
  const prisonCodes = config.rollout.prisons

  let prisoners = [] as Prisoner[]

  for (let i = 0; i < prisonCodes.length; i += 1) {
    // TODO: This will be replaced by a single call to elastic search to find all prisoners due for release
    // In sequence rather than in parallel because elastic search cannot handle many requests
    // eslint-disable-next-line no-await-in-loop
    const prisonersFromPrison = await getEligiblePrisoners(prisonCodes[i])
    prisoners = prisoners.concat(prisonersFromPrison)
  }

  return prisoners
}

const getEligiblePrisoners = async (prisonCode: string): Promise<Prisoner[]> => {
  return prisonerService
    .searchPrisonersByPrison(prisonCode)
    .then(prisoners => filterPrisonersReleasedWithinNoticePeriod(prisoners))
    .then(prisoners => caseloadService.mapOffendersToLicences(prisoners))
    .then(prisoners =>
      prisoners
        .filter(
          prisoner =>
            prisoner.licenceStatus === LicenceStatus.NOT_STARTED || prisoner.licenceStatus === LicenceStatus.IN_PROGRESS
        )
        .map(prisoner => prisoner.nomisRecord)
    )
}

const filterPrisonersReleasedWithinNoticePeriod = (prisoners: Prisoner[]): Prisoner[] => {
  const initialPromptPeriod = filterPrisonersForReleaseWithWeekRange(prisoners, 13, 14)
  const regularPromptPeriod = filterPrisonersForReleaseWithWeekRange(prisoners, 0, 5)
  return initialPromptPeriod.concat(regularPromptPeriod)
}

const filterPrisonersForReleaseWithWeekRange = (
  prisoners: Prisoner[],
  startWeek: number,
  endWeek: number
): Prisoner[] => {
  return prisoners
    .filter(prisoner => {
      return moment(prisoner.conditionalReleaseDate, 'YYYY-MM-DD').isSameOrAfter(
        moment().add(startWeek, 'weeks'),
        'day'
      )
    })
    .filter(prisoner => {
      return moment(prisoner.conditionalReleaseDate, 'YYYY-MM-DD').isBefore(moment().add(endWeek, 'weeks'), 'day')
    })
}

const matchPrisonAndProbationRecords = async (prisoners: Prisoner[]): Promise<ManagedCase[]> => {
  const nomsNumbers = prisoners.map(prisoner => prisoner.prisonerNumber).filter(nomsNumber => nomsNumber)
  const probationers = await communityService.getOffendersByNomsNumbers(nomsNumbers)
  return prisoners
    .map(prisoner => {
      return {
        nomisRecord: prisoner,
        deliusRecord: probationers.find(probationer => probationer.otherIds.nomsNumber === prisoner.prisonerNumber),
      }
    })
    .filter(managedCase => managedCase.nomisRecord && managedCase.deliusRecord)
}

const buildEmailGroups = async (managedCases: ManagedCase[]): Promise<EmailContact[]> => {
  const staffCodes = _.uniq(
    managedCases.map(prisoner => prisoner.deliusRecord.offenderManagers.find(manager => manager.active)?.staff.code)
  )

  const staff = await communityService.getStaffDetailByStaffCodeList(staffCodes)

  const prisonersWithComEmail = managedCases.map(prisoner => {
    const responsibleComStaffCode = prisoner.deliusRecord.offenderManagers.find(manager => manager.active)?.staff.code
    const responsibleCom = staff.find(com => com.staffCode && com.staffCode === responsibleComStaffCode)

    return {
      prisoner: prisoner.nomisRecord,
      email: responsibleCom.email,
    }
  })

  return _.chain(prisonersWithComEmail)
    .groupBy('email')
    .map((emailGroup, email) => {
      const prisoners = emailGroup.map(managedOffender => managedOffender.prisoner)

      return {
        initialPromptCases: filterPrisonersForReleaseWithWeekRange(prisoners, 13, 14),
        urgentPromptCases: filterPrisonersForReleaseWithWeekRange(prisoners, 0, 5),
        email,
      } as EmailContact
    })
    .value()
}

const notifyComOfUpcomingReleases = (emailGroups: EmailContact[]) => {
  // TODO use GOV notify to email COM about upcoming releases. Should this be a separate email for each release or one single email?
  logger.info(JSON.stringify(emailGroups))
}

pollPrisonersDueForLicence()
  .then(prisoners => matchPrisonAndProbationRecords(prisoners))
  .then(prisoners => buildEmailGroups(prisoners))
  .then(emailGroups => notifyComOfUpcomingReleases(emailGroups))
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while sending emails')
    flush({ callback: () => process.exit() }, 'failure')
  })
