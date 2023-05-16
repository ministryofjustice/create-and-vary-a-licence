import LicenceApiClient from '../data/licenceApiClient'
import LicenceOverrideService from './licenceOverrideService'
import LicenceStatus from '../enumeration/licenceStatus'
import type { User } from '../@types/CvlUserDetails'

jest.mock('../data/licenceApiClient')

describe('Licence Override Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const overrideStatus = new LicenceOverrideService(licenceApiClient)
  const user = { username: 'bob' } as User

  it('Updates licence status code', () => {
    overrideStatus.overrideStatusCode(1, LicenceStatus.IN_PROGRESS, 'Test Reason', user)
    expect(licenceApiClient.overrideStatusCode).toHaveBeenCalledWith(
      1,
      {
        statusCode: LicenceStatus.IN_PROGRESS,
        reason: 'Test Reason',
      },
      user
    )
  })
})
