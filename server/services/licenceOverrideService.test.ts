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

  it('Updates licence dates', () => {
    const dates = {
      conditionalReleaseDate: '01/01/2022',
      actualReleaseDate: '02/01/2022',
      sentenceStartDate: '03/01/2022',
      sentenceEndDate: '04/01/2022',
      licenceStartDate: '28/09/2021',
      licenceExpiryDate: '05/01/2022',
      topupSupervisionStartDate: '06/01/2022',
      topupSupervisionExpiryDate: '07/01/2022',
    }
    const reason = 'reason to update dates'

    overrideStatus.overrideDates(1, { ...dates, reason }, user)
    expect(licenceApiClient.overrideLicenceDates).toHaveBeenCalledWith(1, { ...dates, reason }, user)
  })
})
