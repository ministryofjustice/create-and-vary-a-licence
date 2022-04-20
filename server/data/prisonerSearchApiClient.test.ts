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

  it('Search Prisoner by booking ids', async () => {
    post.mockResolvedValue([{ firstName: 'Joe', lastName: 'Bloggs' } as Prisoner])

    const result = await prisonerSearchApiClient.searchPrisonersByBookingIds({ bookingIds: [1234] }, {
      username: 'joebloggs',
    } as User)

    expect(post).toHaveBeenCalledWith(
      { path: '/prisoner-search/booking-ids', data: { bookingIds: [1234] } },
      { username: 'joebloggs' }
    )
    expect(result).toEqual([{ firstName: 'Joe', lastName: 'Bloggs' }])
  })

  it('Search Prisoner by release date', async () => {
    post.mockResolvedValue({ content: [{ firstName: 'Joe', lastName: 'Bloggs' }] })

    const result = await prisonerSearchApiClient.searchPrisonersByReleaseDate('2022-01-01', '2022-01-01', ['MDI'], {
      username: 'joebloggs',
    } as User)

    expect(post).toHaveBeenCalledWith(
      {
        path: '/prisoner-search/release-date-by-prison',
        query: {
          size: 2000,
        },
        data: {
          earliestReleaseDate: '2022-01-01',
          latestReleaseDate: '2022-01-01',
          prisonIds: ['MDI'],
        },
      },
      { username: 'joebloggs' }
    )
    expect(result).toEqual({ content: [{ firstName: 'Joe', lastName: 'Bloggs' }] })
  })
})
