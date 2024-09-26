import ManageUsersApiClient from './manageUsersApiClient'
import { createRedisClient } from './redisClient'

import { RedisTokenStore } from './tokenStore'
import PrisonApiClient from './prisonApiClient'
import PrisonerSearchApiClient from './prisonerSearchApiClient'
import DeliusClient from './deliusClient'
import ProbationSearchApiClient from './probationSearchApiClient'
import LicenceApiClient from './licenceApiClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import { getSystemToken } from './systemToken'
import FeComponentsClient from './feComponentsClient'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => {
  const redisClient = createRedisClient()

  const tokenStore = new RedisTokenStore(getSystemToken, redisClient)
  const manageUsersApiClient = new ManageUsersApiClient(tokenStore)
  const prisonApiClient = new PrisonApiClient(tokenStore)
  const prisonerSearchApiClient = new PrisonerSearchApiClient(tokenStore)
  const deliusClient = new DeliusClient(tokenStore)
  const probationSearchApiClient = new ProbationSearchApiClient(tokenStore)
  const licenceApiClient = new LicenceApiClient(tokenStore)
  const prisonRegisterApiClient = new PrisonRegisterApiClient(tokenStore)
  const feComponentsClient = new FeComponentsClient(tokenStore)

  return {
    redisClient,
    manageUsersApiClient,
    prisonApiClient,
    prisonerSearchApiClient,
    deliusClient,
    probationSearchApiClient,
    licenceApiClient,
    prisonRegisterApiClient,
    feComponentsClient,
  }
}
export type DataAccess = ReturnType<typeof dataAccess>

export {
  LicenceApiClient,
  PrisonApiClient,
  PrisonerSearchApiClient,
  ProbationSearchApiClient,
  PrisonRegisterApiClient,
  DeliusClient,
  ManageUsersApiClient,
  RestClientBuilder,
}
