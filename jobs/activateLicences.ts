import superagent from 'superagent'
import querystring from 'querystring'
import moment from 'moment'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import logger from '../logger'

import generateOauthClientToken from '../server/authentication/clientCredentials'
import config from '../server/config'
import { LicenceSummary } from '../server/@types/licenceApiClientTypes'
import LicenceStatus from '../server/enumeration/licenceStatus'
import LicenceApiClient from '../server/data/licenceApiClient'
import PrisonerSearchApiClient from '../server/data/prisonerSearchApiClient'
import { Prisoner } from '../server/@types/prisonerSearchApiClientTypes'

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

const getSystemClientTokenFromHmppsAuth = (): Promise<superagent.Response> => {
  const clientToken = generateOauthClientToken(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret
  )

  const authRequest = querystring.stringify({ grant_type: 'client_credentials' })

  logger.info(`HMPPS Auth request '${authRequest}' for client id '${config.apis.hmppsAuth.systemClientId}'`)

  return superagent
    .post(`${config.apis.hmppsAuth.url}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(authRequest)
    .timeout(config.apis.hmppsAuth.timeout)
}

const getApprovedLicences = async (): Promise<LicenceSummary[]> => {
  const authResponse = await getSystemClientTokenFromHmppsAuth()
  return new LicenceApiClient(authResponse.body.access_token).matchLicences([LicenceStatus.APPROVED])
}

const getPrisoners = async (nomisIds: string[]): Promise<Prisoner[]> => {
  if (nomisIds.length === 0) {
    return []
  }

  const authResponse = await getSystemClientTokenFromHmppsAuth()
  const prisonerSearchCriteria = {
    prisonerNumbers: nomisIds,
  }
  return new PrisonerSearchApiClient(authResponse.body.access_token).searchPrisonersByNomsIds(prisonerSearchCriteria)
}

const batchActivateLicences = async (licenceIds: number[]): Promise<void> => {
  if (licenceIds.length > 0) {
    const authResponse = await getSystemClientTokenFromHmppsAuth()
    await new LicenceApiClient(authResponse.body.access_token).batchActivateLicences(licenceIds)
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
