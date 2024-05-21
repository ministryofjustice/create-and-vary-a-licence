/* eslint-disable import/first */
/*
 * Do appinsights first to instrument the logger
 */
import 'reflect-metadata'
import { flush, initialiseAppInsights } from '../server/utils/azureAppInsights'
import applicationInfo from '../server/applicationInfo'

initialiseAppInsights(applicationInfo('create-and-vary-a-licence-prompt-licence-create-job'))

import logger from '../logger'
import { services } from '../server/services'
import PromptLicenceCreationService from './promptLicenceCreationService'

const { caseloadService, communityService, licenceService, licenceApiClient } = services

const promptLicenceCreationService = new PromptLicenceCreationService(
  licenceService,
  caseloadService,
  communityService,
  licenceApiClient
)

promptLicenceCreationService
  .run()
  .then(() => {
    // Flush logs to app insights and only exit when complete
    flush({ callback: () => process.exit() }, 'success')
  })
  .catch((error: Error) => {
    logger.error(error, 'Problem occurred while sending emails')
    flush({ callback: () => process.exit(1) }, 'failure')
  })
