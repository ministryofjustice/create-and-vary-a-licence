import { flush } from '../utils/azureAppInsights'
import logger from '../../logger'

const registerUncaughtExceptionMonitor = () => {
  process.on('uncaughtExceptionMonitor', (error: Error, origin) => {
    logger.error(`uncaught exception: error: ${error}, origin: ${origin}`)
    flush({}, 'uncaught exception')
  })
}

const registerAppEventHandlers = () => {
  registerUncaughtExceptionMonitor()
}

export default registerAppEventHandlers
