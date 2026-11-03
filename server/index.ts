import createApp from './app'
import { services } from './services'
import type { ApplicationInfo } from './applicationInfo'

const app = (applicationInfo: ApplicationInfo) => createApp(services, applicationInfo)

export default app
