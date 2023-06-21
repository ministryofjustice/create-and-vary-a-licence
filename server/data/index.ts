/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'

import { RedisTokenStore } from './tokenStore'
import PrisonApiClient from './prisonApiClient'
import PrisonerSearchApiClient from './prisonerSearchApiClient'
import CommunityApiClient from './communityApiClient'
import ProbationSearchApiClient from './probationSearchApiClient'
import LicenceApiClient from './licenceApiClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import { getSystemToken } from './systemToken'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => {
  const redisClient = createRedisClient()

  const tokenStore = new RedisTokenStore(getSystemToken, redisClient)
  const hmppsAuthClient = new HmppsAuthClient(tokenStore)
  const prisonApiClient = new PrisonApiClient(tokenStore)
  const prisonerSearchApiClient = new PrisonerSearchApiClient(tokenStore)
  const communityApiClient = new CommunityApiClient(tokenStore)
  const probationSearchApiClient = new ProbationSearchApiClient(tokenStore)
  const licenceApiClient = new LicenceApiClient(tokenStore)
  const prisonRegisterApiClient = new PrisonRegisterApiClient(tokenStore)

  return {
    redisClient,
    hmppsAuthClient,
    prisonApiClient,
    prisonerSearchApiClient,
    communityApiClient,
    probationSearchApiClient,
    licenceApiClient,
    prisonRegisterApiClient,
  }
}
export type DataAccess = ReturnType<typeof dataAccess>

export {
  LicenceApiClient,
  PrisonApiClient,
  PrisonerSearchApiClient,
  ProbationSearchApiClient,
  PrisonRegisterApiClient,
  CommunityApiClient,
  HmppsAuthClient,
  RestClientBuilder,
}
