import ReleaseEventHandler from './releaseEventHandler'
import { DomainEventMessage } from '../../../@types/events'
import LicenceApiClient from '../../../data/licenceApiClient'

jest.mock('../../../data/licenceApiClient')

const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>

describe('Release event handler', () => {
  const handler = new ReleaseEventHandler(licenceApiClient)
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should skip the event if release reason is not RELEASED', async () => {
    const event = {
      additionalInformation: {
        reason: 'HOSPITAL',
      },
    } as DomainEventMessage

    await handler.handle(event)

    expect(licenceApiClient.triggerReleaseProcess).not.toHaveBeenCalled()
  })

  it('should trigger release process', async () => {
    const event = {
      additionalInformation: {
        reason: 'RELEASED',
        nomsNumber: 'ABC1234',
      },
    } as DomainEventMessage

    await handler.handle(event)

    expect(licenceApiClient.triggerReleaseProcess).toHaveBeenCalledWith('ABC1234')
  })
})
