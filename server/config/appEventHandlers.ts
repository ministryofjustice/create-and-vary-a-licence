import { flush } from '../utils/azureAppInsights'
import logger from '../../logger'

const registerUncaughtExceptionMonitor = () => {
  process.on('uncaughtExceptionMonitor', (error: Error, origin) => {
    logger.error({ err: error, origin }, 'uncaught exception')
    flush(
      {
        isAppCrashing: true,
        callback: () => process.exit(1),
      },
      'uncaught exception',
    )
  })
}

const registerAppEventHandlers = () => {
  registerUncaughtExceptionMonitor()
}

export default registerAppEventHandlers
