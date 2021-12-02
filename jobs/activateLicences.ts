import moment from 'moment'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import logger from '../logger'

import { LicenceSummary } from '../server/@types/licenceApiClientTypes'
import LicenceStatus from '../server/enumeration/licenceStatus'
import LicenceApiClient from '../server/data/licenceApiClient'
import PrisonerSearchApiClient from '../server/data/prisonerSearchApiClient'
import { Prisoner } from '../server/@types/prisonerSearchApiClientTypes'
import HmppsAuthClient from '../server/data/hmppsAuthClient'
import TokenStore from '../server/data/tokenStore'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-activate-licences-job')

const pollLicencesToActivate = async (): Promise<LicenceSummary[]> => {
  const approvedLicences = await getApprovedLicences()
  const nomisIds = approvedLicences.map(licence => licence.nomisId)
  const prisonersWithApprovedLicences = await getPrisoners(nomisIds)
  const releasedPrisonerNumbers = prisonersWithApprovedLicences
    .filter(prisoner => {
      return (
        prisoner.status.startsWith('INACTIVE') &&
        prisoner.confirmedReleaseDate &&
        moment(prisoner.confirmedReleaseDate, 'YYYY-MM-DD').isSameOrBefore(moment())
      )
    })
    .map(prisoner => prisoner.prisonerNumber)
  return approvedLicences.filter(licence => releasedPrisonerNumbers.includes(licence.nomisId))
}

const getSystemClientTokenFromHmppsAuth = (): Promise<string> => {
  return new HmppsAuthClient(new TokenStore()).getSystemClientToken()
}

const getApprovedLicences = async (): Promise<LicenceSummary[]> => {
  const token = await getSystemClientTokenFromHmppsAuth()
  return new LicenceApiClient(token).matchLicences([LicenceStatus.APPROVED])
}

const getPrisoners = async (nomisIds: string[]): Promise<Prisoner[]> => {
  if (nomisIds.length === 0) {
    return []
  }

  const token = await getSystemClientTokenFromHmppsAuth()
  const prisonerSearchCriteria = {
    prisonerNumbers: nomisIds,
  }
  return new PrisonerSearchApiClient(token).searchPrisonersByNomsIds(prisonerSearchCriteria)
}

const batchActivateLicences = async (licenceIds: number[]): Promise<void> => {
  if (licenceIds.length > 0) {
    const token = await getSystemClientTokenFromHmppsAuth()
    await new LicenceApiClient(token).batchActivateLicences(licenceIds)
  }
}

pollLicencesToActivate()
  .then(async licences => {
    const licenceIds = licences.map(licence => licence.licenceId)
    await batchActivateLicences(licenceIds)
  })
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while activating licences')
    flush({ callback: () => process.exit() }, 'failure')
  })
