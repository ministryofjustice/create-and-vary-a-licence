import HmppsRestClient from './hmppsRestClient'
import ProbationSearchApiClient from './probationSearchApiClient'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getAuthToken: () => '' }
  })
})

const probationSearchApiClient = new ProbationSearchApiClient()

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
})
