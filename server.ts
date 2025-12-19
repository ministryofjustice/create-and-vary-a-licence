/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights } from './server/utils/azureAppInsights'
import createApplicationInfo from './server/applicationInfo'

const applicationInfo = createApplicationInfo()
initialiseAppInsights(applicationInfo)

import logger from './logger'

import { app, sqsPrisonEventsListener, sqsDomainEventsListener } from './server/index'

const server = app(applicationInfo)

server.listen(server.get('port'), () => {
  logger.info(`Server listening on port ${server.get('port')}`)
})
sqsPrisonEventsListener.app.start()
sqsDomainEventsListener.app.start()
