import { initDprReportingClients } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/data/dprReportingClient'
import ManageUsersApiClient from './manageUsersApiClient'
import { createRedisClient } from './redisClient'

import { RedisTokenStore } from './tokenStore'
import PrisonApiClient from './prisonApiClient'
import PrisonerSearchApiClient from './prisonerSearchApiClient'
import DeliusClient from './deliusClient'
import LicenceApiClient from './licenceApiClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import { getSystemToken } from './systemToken'
import FeComponentsClient from './feComponentsClient'
import config from '../config'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => {
  const redisClient = createRedisClient()

  const {
    reportingClient,
    dashboardClient,
    reportDataStore,
    productCollectionClient,
    missingReportClient,
    featureFlagService,
  } = initDprReportingClients(config.apis.licenceApi, createRedisClient())

  const tokenStore = new RedisTokenStore(getSystemToken, redisClient)
  const manageUsersApiClient = new ManageUsersApiClient(tokenStore)
  const prisonApiClient = new PrisonApiClient(tokenStore)
  const prisonerSearchApiClient = new PrisonerSearchApiClient(tokenStore)
  const deliusClient = new DeliusClient(tokenStore)
  const licenceApiClient = new LicenceApiClient(tokenStore)
  const prisonRegisterApiClient = new PrisonRegisterApiClient(tokenStore)
  const feComponentsClient = new FeComponentsClient(tokenStore)

  return {
    redisClient,
    manageUsersApiClient,
    prisonApiClient,
    prisonerSearchApiClient,
    deliusClient,
    licenceApiClient,
    prisonRegisterApiClient,
    feComponentsClient,

    // dpr components
    reportingClient,
    dashboardClient,
    reportDataStore,
    productCollectionClient,
    missingReportClient,
    featureFlagService,
  }
}
export type DataAccess = ReturnType<typeof dataAccess>

export {
  LicenceApiClient,
  PrisonApiClient,
  PrisonerSearchApiClient,
  PrisonRegisterApiClient,
  DeliusClient,
  ManageUsersApiClient,
}

export type { RestClientBuilder }
