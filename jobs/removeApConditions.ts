/* eslint-disable import/first */
/*
 * Do appinsights first to instrument the logger
 */
import 'reflect-metadata'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-remove-ap-conditions-job')

import logger from '../logger'

import LicenceApiClient from '../server/data/licenceApiClient'
import { InMemoryTokenStore } from '../server/data/tokenStore'
import { getSystemTokenWithRetries } from '../server/data/systemToken'

const licenceApiClient = new LicenceApiClient(new InMemoryTokenStore(getSystemTokenWithRetries))

licenceApiClient
  .runRemoveAPConditionsJob()
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while running job to remove AP conditions for licences in PSS Period')
    flush({ callback: () => process.exit() }, 'failure')
  })
