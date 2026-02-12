import HmppsRestClient from './hmppsRestClient'
import ManageUsersApiClient, { UserDetails, UserEmail } from './manageUsersApiClient'
import { User } from '../@types/CvlUserDetails'
import { InMemoryTokenStore } from './tokenStore'

const authClient = new ManageUsersApiClient(
  new InMemoryTokenStore(async _username => ({ token: 'token-1', expiresIn: 1234 })),
)

describe('Auth Api client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')

  beforeEach(() => {
    get.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Get user', async () => {
    get.mockResolvedValue({ name: 'Joe Bloggs' } as UserDetails)

    const result = await authClient.getUser({ token: 'token' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/users/me' }, { token: 'token' })
    expect(result).toEqual({ name: 'Joe Bloggs' })
  })

  it('Get user email', async () => {
    get.mockResolvedValue({ email: 'jbloggs@justice.gov.uk' } as UserEmail)

    const result = await authClient.getUserEmail({ token: 'token' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/users/me/email' }, { token: 'token' })
    expect(result).toEqual({ email: 'jbloggs@justice.gov.uk' })
  })
})
