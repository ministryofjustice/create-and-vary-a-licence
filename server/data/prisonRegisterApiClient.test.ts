import HmppsRestClient from './hmppsRestClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import { PrisonDto } from '../@types/prisonRegisterTypes'
import { User } from '../@types/CvlUserDetails'
import { InMemoryTokenStore } from './tokenStore'

const prisonRegisterApiClient = new PrisonRegisterApiClient(
  new InMemoryTokenStore(async _username => ({ token: 'token-1', expiresIn: 1234 })),
)

describe('Prison Register Api client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')

  beforeEach(() => {
    get.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Get prison description', async () => {
    get.mockResolvedValue({ prisonName: 'Moorland (HMP)' } as PrisonDto)

    const result = await prisonRegisterApiClient.getPrisonDescription('MDI', { username: 'joebloggs' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/prisons/id/MDI' }, { username: 'joebloggs' })
    expect(result).toEqual({ prisonName: 'Moorland (HMP)' })
  })
})
