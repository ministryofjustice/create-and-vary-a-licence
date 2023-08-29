/* eslint-disable import/first */
/*
 * Do appinsights first to instrument the logger
 */
import 'reflect-metadata'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-expire-licences-job')

import { services } from '../server/services'
import logger from '../logger'

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
