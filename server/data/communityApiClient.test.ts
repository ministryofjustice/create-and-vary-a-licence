import HmppsRestClient from './hmppsRestClient'
import CommunityApiClient from './communityApiClient'
import {
  CommunityApiManagedOffender,
  CommunityApiStaffDetails,
  CommunityApiTeamManagedCase,
} from '../@types/communityClientTypes'
import { User } from '../@types/CvlUserDetails'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getAuthToken: () => '' }
  })
})

const communityApiClient = new CommunityApiClient()

describe('Community Api client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')

  beforeEach(() => {
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
})
