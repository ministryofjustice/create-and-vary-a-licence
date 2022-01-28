import createApp from './app'
import { services } from './services'
import createPrisonEventSqsListener from './listeners/sqsPrisonEventsListener'
import createProbationEventSqsListener from './listeners/sqsProbationEventsListener'
import createDomainEventSqsListener from './listeners/sqsDomainEventsListener'

const app = createApp(services)
const sqsPrisonEventsListener = createPrisonEventSqsListener()
const sqsProbationEventsListener = createProbationEventSqsListener(services)
const sqsDomainEventsListener = createDomainEventSqsListener(services)

export { app, sqsPrisonEventsListener, sqsProbationEventsListener, sqsDomainEventsListener }
