import createApp from './app'
import { services } from './services'
import createPrisonEventSqsListener from './listeners/sqsPrisonEventsListener'
import createDomainEventSqsListener from './listeners/sqsDomainEventsListener'
import type { ApplicationInfo } from './applicationInfo'
import registerAppEventHandlers from './config/appEventHandlers'

registerAppEventHandlers()

const app = (applicationInfo: ApplicationInfo) => createApp(services, applicationInfo)
const sqsPrisonEventsListener = createPrisonEventSqsListener(services)
const sqsDomainEventsListener = createDomainEventSqsListener(services)

export { app, sqsPrisonEventsListener, sqsDomainEventsListener }
