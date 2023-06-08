import 'reflect-metadata'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import logger from '../logger'

import LicenceApiClient from '../server/data/licenceApiClient'
import { InMemoryTokenStore } from '../server/data/tokenStore'
import { getSystemToken } from '../server/data/systemToken'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-activate-licences-job')

const licenceApiClient = new LicenceApiClient(new InMemoryTokenStore(getSystemToken))

licenceApiClient
  .runLicenceActivationJob()
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while activating licences')
    flush({ callback: () => process.exit() }, 'failure')
  })
