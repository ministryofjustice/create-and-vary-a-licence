import moment from 'moment'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import logger from '../logger'

import { LicenceSummary } from '../server/@types/licenceApiClientTypes'
import LicenceStatus from '../server/enumeration/licenceStatus'
import LicenceApiClient from '../server/data/licenceApiClient'
import PrisonApiClient from '../server/data/prisonApiClient'
import PrisonerSearchApiClient from '../server/data/prisonerSearchApiClient'
import { Prisoner } from '../server/@types/prisonerSearchApiClientTypes'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-activate-licences-job')

type LicencesToUpdate = {
  forActivation: number[]
  forInactivation: number[]
}

const pollLicencesToUpdate = async (): Promise<LicencesToUpdate> => {
  const approvedLicences = await getApprovedLicences()
  const nomisIds = approvedLicences.map(licence => licence.nomisId)
  const prisonersWithApprovedLicences = await getPrisoners(nomisIds)
  const bookingIds = prisonersWithApprovedLicences.map(prisoner => parseInt(prisoner.bookingId, 10))
  const hdcStatusList = await getHdcStatuses(bookingIds)

  /*
   * get list of offenders who have been released from prison ('INACTIVE' status from Nomis indicates they are released)
   * and a confirmed release date exists, which is before or equal to today
   */
  const prisonersForRelease = prisonersWithApprovedLicences.filter(prisoner => {
    return (
      prisoner.status.startsWith('INACTIVE') &&
      prisoner.confirmedReleaseDate &&
      moment(prisoner.confirmedReleaseDate, 'YYYY-MM-DD').isSameOrBefore(moment())
    )
  })

  const prisonerNumbers = prisonersForRelease.map(prisoner => prisoner.prisonerNumber)
  const filteredLicences = approvedLicences.filter(licence => prisonerNumbers.includes(licence.nomisId))

  const licencesToActivate: number[] = []
  const licencesToInactivate: number[] = []

  /*
   * Check for an approved HDC licence. If one exists, we must inactivate the
   */
  filteredLicences.forEach(prisoner => {
    const { bookingId } = prisoner
    if (hdcStatusList.get(bookingId) === 'APPROVED') {
      licencesToInactivate.push(prisoner.licenceId)
    } else {
      licencesToActivate.push(prisoner.licenceId)
    }
  })

  return {
    forActivation: licencesToActivate,
    forInactivation: licencesToInactivate,
  } as LicencesToUpdate
}

const getApprovedLicences = async (): Promise<LicenceSummary[]> => {
  return new LicenceApiClient().matchLicences([LicenceStatus.APPROVED])
}

const getHdcStatuses = async (bookingIds: number[]): Promise<Map<number, string>> => {
  const hdcList = new Map<number, string>()

  if (bookingIds.length === 0) {
    return hdcList
  }

  await new PrisonApiClient()
    .getLatestHdcStatusBatch(bookingIds)
    .then(r => r.forEach(hdc => hdcList.set(hdc.bookingId, hdc.approvalStatus)))
  return hdcList
}

const getPrisoners = async (nomisIds: string[]): Promise<Prisoner[]> => {
  if (nomisIds.length === 0) {
    return []
  }

  const prisonerSearchCriteria = {
    prisonerNumbers: nomisIds,
  }
  return new PrisonerSearchApiClient().searchPrisonersByNomsIds(prisonerSearchCriteria)
}

const batchActivateLicences = async (licenceIds: number[]): Promise<void> => {
  if (licenceIds.length > 0) {
    await new LicenceApiClient().batchActivateLicences(licenceIds)
  }
}

const batchInactivateLicences = async (licenceIds: number[]): Promise<void> => {
  if (licenceIds.length > 0) {
    await new LicenceApiClient().batchInActivateLicences(licenceIds)
  }
}

pollLicencesToUpdate()
  .then(async licences => {
    await batchActivateLicences(licences.forActivation)
    await batchInactivateLicences(licences.forInactivation)
  })
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while activating licences')
    flush({ callback: () => process.exit() }, 'failure')
  })
