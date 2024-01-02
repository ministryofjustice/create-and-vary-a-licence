/* eslint-disable import/first */
/*
 * Do appinsights first to instrument the logger
 */
import 'reflect-metadata'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-expire-licences-job')

import LicenceApiClient from '../server/data/licenceApiClient'
import logger from '../logger'
import { InMemoryTokenStore } from '../server/data/tokenStore'
import { getSystemTokenWithRetries } from '../server/data/systemToken'

const licenceApiClient = new LicenceApiClient(new InMemoryTokenStore(getSystemTokenWithRetries))

licenceApiClient
  .runLicenceExpiryJob()
  .then(results => {
    logger.info(results)
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while expiring licences')
    flush({ callback: () => process.exit(1) }, 'failure')
  })
