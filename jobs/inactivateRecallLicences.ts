/* eslint-disable import/first */
/*
 * Do appinsights first to instrument the logger
 */
import 'reflect-metadata'
import { initialiseAppInsights, flush } from '../server/utils/azureAppInsights'
import applicationInfo from '../server/applicationInfo'

initialiseAppInsights(applicationInfo('create-and-vary-a-licence-inactivate-recall-licences'))

import logger from '../logger'

import LicenceApiClient from '../server/data/licenceApiClient'
import { InMemoryTokenStore } from '../server/data/tokenStore'
import { getSystemTokenWithRetries } from '../server/data/systemToken'

const licenceApiClient = new LicenceApiClient(new InMemoryTokenStore(getSystemTokenWithRetries))

licenceApiClient
  .runInactivateRecallLicencesJob()
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while inactivating recall licences')
    flush({ callback: () => process.exit(1) }, 'failure')
  })
