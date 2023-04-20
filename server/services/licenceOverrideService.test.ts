import LicenceApiClient from '../data/licenceApiClient'
import LicenceOverrideService from './licenceOverrideService'
import LicenceStatus from '../enumeration/licenceStatus'
import { User } from '../@types/CvlUserDetails'

jest.mock('../data/licenceApiClient')

describe('Licence Override Service', () => {
  const licenceApiClient = new LicenceApiClient() as jest.Mocked<LicenceApiClient>
  const overrideStatus = new LicenceOverrideService(licenceApiClient)
  it('Updates licence status code', () => {
    overrideStatus.overrideStatusCode(1, LicenceStatus.IN_PROGRESS, 'Test Reason', { username: 'Test User' } as User)
    expect(licenceApiClient.overrideStatusCode).toHaveBeenCalledWith(
      1,
      {
        statusCode: LicenceStatus.IN_PROGRESS,
        reason: 'Test Reason',
      },
      { username: 'Test User' }
    )
  })
})
