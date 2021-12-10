import HmppsRestClient from './hmppsRestClient'
import PrisonerSearchApiClient from './prisonerSearchApiClient'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import { User } from '../@types/CvlUserDetails'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getAuthToken: () => '' }
  })
})

const prisonerSearchApiClient = new PrisonerSearchApiClient()

describe('Prisoner Search Api client tests', () => {
  const post = jest.spyOn(HmppsRestClient.prototype, 'post')

  beforeEach(() => {
    post.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Search Prisoner', async () => {
    post.mockResolvedValue([{ firstName: 'Joe', lastName: 'Bloggs' } as Prisoner])

    const result = await prisonerSearchApiClient.searchPrisoners(
      { lastName: 'Bloggs' } as PrisonerSearchCriteria,
      { username: 'joebloggs' } as User
    )

    expect(post).toHaveBeenCalledWith(
      { path: '/prisoner-search/match-prisoners', data: { lastName: 'Bloggs' } },
      { username: 'joebloggs' }
    )
    expect(result).toEqual([{ firstName: 'Joe', lastName: 'Bloggs' }])
  })

  it('Search Prisoner by nomis ids', async () => {
    post.mockResolvedValue([{ firstName: 'Joe', lastName: 'Bloggs' } as Prisoner])

    const result = await prisonerSearchApiClient.searchPrisonersByNomsIds({ prisonerNumbers: ['ABC1234'] }, {
      username: 'joebloggs',
    } as User)

    expect(post).toHaveBeenCalledWith(
      { path: '/prisoner-search/prisoner-numbers', data: { prisonerNumbers: ['ABC1234'] } },
      { username: 'joebloggs' }
    )
    expect(result).toEqual([{ firstName: 'Joe', lastName: 'Bloggs' }])
  })
})
