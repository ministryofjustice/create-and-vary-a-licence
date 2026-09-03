import logger from '../../logger'
import * as azureAppInsights from '../utils/azureAppInsights'
import registerAppEventHandlers from './appEventHandlers'

jest.mock('../../logger')
jest.mock('../utils/azureAppInsights')

describe('App event handlers', () => {
  let processOnSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(azureAppInsights.flush).mockResolvedValue()
    processOnSpy = jest.spyOn(process, 'on')
  })

  afterEach(() => {
    processOnSpy.mockRestore()
  })

  it('should register uncaughtExceptionMonitor handler', () => {
    registerAppEventHandlers()
    expect(processOnSpy).toHaveBeenCalledWith('uncaughtExceptionMonitor', expect.any(Function))
  })

  it('should log error and flush on uncaught exception', () => {
    registerAppEventHandlers()

    // Get the handler that was registered
    const handler = processOnSpy.mock.calls[0][1]
    const testError = new Error('Test exception')

    handler(testError, 'uncaughtException')

    expect(logger.error).toHaveBeenCalledWith({ err: testError, origin: 'uncaughtException' }, 'uncaught exception')
    expect(azureAppInsights.flush).toHaveBeenCalledWith()
  })

  it('should log when flushing telemetry fails', async () => {
    const flushError = new Error('Telemetry unavailable')
    jest.mocked(azureAppInsights.flush).mockRejectedValueOnce(flushError)

    registerAppEventHandlers()

    const handler = processOnSpy.mock.calls[0][1]
    handler(new Error('Test exception'), 'uncaughtException')

    await Promise.resolve()

    expect(logger.error).toHaveBeenCalledWith({ err: flushError }, 'uncaughtException')
  })
})
