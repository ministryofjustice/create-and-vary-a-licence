import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import LicenceApiClient from '../server/data/licenceApiClient'
import logger from '../logger'
import { InMemoryTokenStore } from '../server/data/tokenStore'
import { getSystemToken } from '../server/data/systemToken'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-email-probation-practioner-job')

const licenceApiClient = new LicenceApiClient(new InMemoryTokenStore(getSystemToken))
licenceApiClient
  .notifyProbationPractionerOfEditedLicencesStillUnapprovedOnCrd()
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while emailing the probation practioner')
    flush({ callback: () => process.exit() }, 'failure')
  })
