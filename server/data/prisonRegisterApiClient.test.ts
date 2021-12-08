import HmppsRestClient from './hmppsRestClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import { PrisonDto } from '../@types/prisonRegisterTypes'

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

    const result = await prisonRegisterApiClient.getPrisonDescription('MDI', 'joebloggs')

    expect(get).toHaveBeenCalledWith({ path: '/prisons/id/MDI' }, 'joebloggs')
    expect(result).toEqual({ prisonName: 'Moorland (HMP)' })
  })

  it('Get prison OMU contact email', async () => {
    get.mockResolvedValue('prisonOmuEmail@justice.gov.uk')

    const result = await prisonRegisterApiClient.getPrisonOmuContactEmail('MDI', 'joebloggs')

    expect(get).toHaveBeenCalledWith(
      { path: '/secure/prisons/id/MDI/offender-management-unit/email-address', responseType: 'text' },
      'joebloggs'
    )
    expect(result).toEqual('prisonOmuEmail@justice.gov.uk')
  })
})
