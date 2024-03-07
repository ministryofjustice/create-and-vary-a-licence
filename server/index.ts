import createApp from './app'
import { services } from './services'
import createPrisonEventSqsListener from './listeners/sqsPrisonEventsListener'
import createProbationEventSqsListener from './listeners/sqsProbationEventsListener'
import createDomainEventSqsListener from './listeners/sqsDomainEventsListener'
import type { ApplicationInfo } from './applicationInfo'

const app = (applicationInfo: ApplicationInfo) => createApp(services, applicationInfo)
const sqsPrisonEventsListener = createPrisonEventSqsListener(services)
const sqsProbationEventsListener = createProbationEventSqsListener(services)
const sqsDomainEventsListener = createDomainEventSqsListener(services)

export { app, sqsPrisonEventsListener, sqsProbationEventsListener, sqsDomainEventsListener }
