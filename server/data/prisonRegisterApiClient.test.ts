import HmppsRestClient from './hmppsRestClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import { PrisonDto } from '../@types/prisonRegisterTypes'
import { User } from '../@types/CvlUserDetails'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getAuthToken: () => '' }
  })
})

const prisonRegisterApiClient = new PrisonRegisterApiClient()

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
