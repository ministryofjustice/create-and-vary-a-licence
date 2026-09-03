import { flush } from '../utils/azureAppInsights'
import logger from '../../logger'

const registerUncaughtExceptionMonitor = () => {
  process.on('uncaughtExceptionMonitor', (error: Error, origin) => {
    logger.error({ err: error, origin }, 'uncaught exception')
    flush().catch(flushError => logger.error({ err: flushError }, 'uncaughtException'))
  })
}

const registerAppEventHandlers = () => {
  registerUncaughtExceptionMonitor()
}

export default registerAppEventHandlers
