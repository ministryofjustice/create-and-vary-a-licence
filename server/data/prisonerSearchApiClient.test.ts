import HmppsRestClient from './hmppsRestClient'
import PrisonerSearchApiClient from './prisonerSearchApiClient'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import { User } from '../@types/CvlUserDetails'
import { InMemoryTokenStore } from './tokenStore'

const prisonerSearchApiClient = new PrisonerSearchApiClient(
  new InMemoryTokenStore(async _username => ({ token: 'token-1', expiresIn: 1234 })),
)

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
      { username: 'joebloggs' } as User,
    )

    expect(post).toHaveBeenCalledWith(
      { path: '/prisoner-search/match-prisoners', data: { lastName: 'Bloggs' } },
      { username: 'joebloggs' },
    )
    expect(result).toEqual([{ firstName: 'Joe', lastName: 'Bloggs' }])
  })

  it('Search Prisoner should return empty array if no booking id is provided', async () => {
    const result = await prisonerSearchApiClient.searchPrisonersByBookingIds({ bookingIds: [] }, {
      username: 'joebloggs',
    } as User)

    expect(post).not.toHaveBeenCalledWith(
      { path: '/prisoner-search/booking-ids', data: { bookingIds: [] } },
      { username: 'joebloggs' },
    )
    expect(result).toEqual([])
  })

  it('Search Prisoner by booking ids', async () => {
    post.mockResolvedValue([{ firstName: 'Joe', lastName: 'Bloggs' } as Prisoner])

    const result = await prisonerSearchApiClient.searchPrisonersByBookingIds({ bookingIds: [1234] }, {
      username: 'joebloggs',
    } as User)

    expect(post).toHaveBeenCalledWith(
      { path: '/prisoner-search/booking-ids', data: { bookingIds: [1234] } },
      { username: 'joebloggs' },
    )
    expect(result).toEqual([{ firstName: 'Joe', lastName: 'Bloggs' }])
  })
})
