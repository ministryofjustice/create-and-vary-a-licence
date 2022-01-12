/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from './server/utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

import { app, sqsPrisonEventsListener, sqsProbationEventsListener, sqsDomainEventsListener } from './server/index'
import logger from './logger'

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})
sqsPrisonEventsListener.app.start()
sqsProbationEventsListener.app.start()
sqsDomainEventsListener.app.start()
