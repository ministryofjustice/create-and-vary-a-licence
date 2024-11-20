import HmppsRestClient from './hmppsRestClient'
import ProbationSearchApiClient from './probationSearchApiClient'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import { InMemoryTokenStore } from './tokenStore'

const probationSearchApiClient = new ProbationSearchApiClient(
  new InMemoryTokenStore(async _username => ({ token: 'token-1', expiresIn: 1234 })),
)

describe('Probation Search Api client tests', () => {
  const post = jest.spyOn(HmppsRestClient.prototype, 'post')

  beforeEach(() => {
    post.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Search Probationer', async () => {
    post.mockResolvedValue([{ firstName: 'Joe', surname: 'Bloggs' } as OffenderDetail])

    const result = await probationSearchApiClient.searchProbationer({ surname: 'Bloggs' })

    expect(post).toHaveBeenCalledWith({ path: '/search', data: { surname: 'Bloggs' } })
    expect(result).toEqual([{ firstName: 'Joe', surname: 'Bloggs' }])
  })

  it('get offenders by crn', async () => {
    post.mockResolvedValue([{ firstName: 'Joe', surname: 'Bloggs' } as OffenderDetail])

    const result = await probationSearchApiClient.getOffendersByCrn(['X1234'])

    expect(post).toHaveBeenCalledWith({ path: '/crns', data: ['X1234'] })
    expect(result).toEqual([{ firstName: 'Joe', surname: 'Bloggs' }])
  })

  it('get offenders by crn', async () => {
    post.mockResolvedValue([{ firstName: 'Joe', surname: 'Bloggs' } as OffenderDetail])

    const result = await probationSearchApiClient.getOffendersByNomsNumbers(['A123457'])

    expect(post).toHaveBeenCalledWith({ path: '/nomsNumbers', data: ['A123457'] })
    expect(result).toEqual([{ firstName: 'Joe', surname: 'Bloggs' }])
  })
})
