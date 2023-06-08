import 'reflect-metadata'
import _ from 'lodash'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import logger from '../logger'

import { LicenceSummary } from '../server/@types/licenceApiClientTypes'
import LicenceStatus from '../server/enumeration/licenceStatus'
import LicenceApiClient from '../server/data/licenceApiClient'
import PrisonApiClient from '../server/data/prisonApiClient'
import PrisonerSearchApiClient from '../server/data/prisonerSearchApiClient'
import { Prisoner } from '../server/@types/prisonerSearchApiClientTypes'
import { isPassedArdOrCrd } from '../server/utils/utils'
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
