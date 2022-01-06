import createApp from './app'
import { services } from './services'
import createPrisonEventSqsListener from './listeners/sqsPrisonEventsListener'
import createProbatiobEventSqsListener from './listeners/sqsProbationEventsListener'

const app = createApp(services)
const sqsPrisonEventsListener = createPrisonEventSqsListener()
const sqsProbationEventsListener = createProbatiobEventSqsListener()

export { app, sqsPrisonEventsListener, sqsProbationEventsListener }
