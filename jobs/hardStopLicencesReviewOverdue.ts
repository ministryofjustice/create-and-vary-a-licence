/* eslint-disable import/first */
/*
 * Do appinsights first to instrument the logger
 */
import 'reflect-metadata'
import { initialiseAppInsights, flush } from '../server/utils/azureAppInsights'
import applicationInfo from '../server/applicationInfo'

initialiseAppInsights(applicationInfo('create-and-vary-a-licence-hard-stop-licences-review-overdue'))

import logger from '../logger'

import LicenceApiClient from '../server/data/licenceApiClient'
import { InMemoryTokenStore } from '../server/data/tokenStore'
import { getSystemTokenWithRetries } from '../server/data/systemToken'

const licenceApiClient = new LicenceApiClient(new InMemoryTokenStore(getSystemTokenWithRetries))

licenceApiClient
  .runHardStopLicencesReviewOverdueJob()
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while retrieving hard stop licences where the review is overdue')
    flush({ callback: () => process.exit(1) }, 'failure')
  })
