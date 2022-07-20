import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import { services } from '../server/services'
import logger from '../logger'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-expire-licences-job')

const { licenceExpiryService } = services

licenceExpiryService
  .expireLicences()
  .then(results => {
    logger.info(results)
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while expiring licences')
    flush({ callback: () => process.exit() }, 'failure')
  })
