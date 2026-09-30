import createApp from './app'
import { services } from './services'
import createDomainEventSqsListener from './listeners/sqsDomainEventsListener'
import type { ApplicationInfo } from './applicationInfo'
import registerAppEventHandlers from './config/appEventHandlers'

registerAppEventHandlers()

const app = (applicationInfo: ApplicationInfo) => createApp(services, applicationInfo)
const sqsDomainEventsListener = createDomainEventSqsListener(services)

export { app, sqsDomainEventsListener }
