import HmppsRestClient from './hmppsRestClient'
import CommunityApiClient from './communityApiClient'
import {
  CommunityApiManagedOffender,
  CommunityApiOffenderManager,
  CommunityApiStaffDetails,
  CommunityApiTeamManagedCase,
} from '../@types/communityClientTypes'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getAuthToken: () => '' }
  })
})

const communityApiClient = new CommunityApiClient()

describe('Community Api client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')
  const post = jest.spyOn(HmppsRestClient.prototype, 'post')

  beforeEach(() => {
    get.mockResolvedValue(true)
    get.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Get staff detail', async () => {
    get.mockResolvedValue({ staffIdentifier: 2000 } as CommunityApiStaffDetails)

    const result = await communityApiClient.getStaffDetailByUsername('joebloggs')

    expect(get).toHaveBeenCalledWith({ path: '/secure/staff/username/joebloggs' })
    expect(result).toEqual({ staffIdentifier: 2000 })
  })

  it('Get staff detail', async () => {
    get.mockResolvedValue({ staffIdentifier: 2000 } as CommunityApiStaffDetails)

    const result = await communityApiClient.getStaffDetailByStaffIdentifier(2000)

    expect(get).toHaveBeenCalledWith({ path: '/secure/staff/staffIdentifier/2000' })
    expect(result).toEqual({ staffIdentifier: 2000 })
  })

  it('Get staff detail by list of usernames', async () => {
    post.mockResolvedValue([{ staffIdentifier: 2000 }] as CommunityApiStaffDetails[])

    const result = await communityApiClient.getStaffDetailsByUsernameList(['joebloggs'])

    expect(post).toHaveBeenCalledWith({ path: '/secure/staff/list', data: ['joebloggs'] })
    expect(result).toEqual([{ staffIdentifier: 2000 }])
  })

  it('Get staff caseload', async () => {
    get.mockResolvedValue({ nomsNumber: 'ABC1234' } as CommunityApiManagedOffender)

    const result = await communityApiClient.getStaffCaseload(2000)

    expect(get).toHaveBeenCalledWith({
      path: '/secure/staff/staffIdentifier/2000/managedOffenders',
      query: { current: true },
    })
    expect(result).toEqual({ nomsNumber: 'ABC1234' })
  })

  it('Get team caseload', async () => {
    get.mockResolvedValue({ nomsNumber: 'ABC1234' } as CommunityApiTeamManagedCase)

    const result = await communityApiClient.getTeamCaseload(['teamA', 'teamB'])

    expect(get).toHaveBeenCalledWith({
      path: '/secure/teams/managedOffenders',
      query: { current: true, teamCode: ['teamA', 'teamB'] },
    })
    expect(result).toEqual({ nomsNumber: 'ABC1234' })
  })

  it("Get a list of an offender's managers", async () => {
    get.mockResolvedValue([{ staffId: 2000 }] as CommunityApiOffenderManager[])

    const result = await communityApiClient.getAnOffendersManagers('X1234')

    expect(get).toHaveBeenCalledWith({
      path: '/secure/offenders/crn/X1234/allOffenderManagers',
    })
    expect(result).toEqual([{ staffId: 2000 }])
  })
})
