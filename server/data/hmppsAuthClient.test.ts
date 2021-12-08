import HmppsRestClient from './hmppsRestClient'
import HmppsAuthClient, { AuthUserDetails, AuthUserEmail } from './hmppsAuthClient'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getAuthToken: () => '' }
  })
})

const authClient = new HmppsAuthClient()

describe('Auth Api client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')

  beforeEach(() => {
    get.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Get user', async () => {
    get.mockResolvedValue({ name: 'Joe Bloggs' } as AuthUserDetails)

    const result = await authClient.getUser('joebloggs')

    expect(get).toHaveBeenCalledWith({ path: '/api/user/me' }, 'joebloggs')
    expect(result).toEqual({ name: 'Joe Bloggs' })
  })

  it('Get user email', async () => {
    get.mockResolvedValue({ email: 'jbloggs@justice.gov.uk' } as AuthUserEmail)

    const result = await authClient.getUserEmail('joebloggs')

    expect(get).toHaveBeenCalledWith({ path: '/api/me/email' }, 'joebloggs')
    expect(result).toEqual({ email: 'jbloggs@justice.gov.uk' })
  })
})
