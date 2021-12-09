import HmppsRestClient from './hmppsRestClient'
import CommunityApiClient from './communityApiClient'
import { CommunityApiManagedOffender, CommunityApiStaffDetails } from '../@types/communityClientTypes'
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

  it('Get staff detail by username', async () => {
    get.mockResolvedValue({ staffIdentifier: 2000 } as CommunityApiStaffDetails)

    const result = await communityApiClient.getStaffDetailByUsername({ username: 'joebloggs' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/secure/staff/username/joebloggs' })
    expect(result).toEqual({ staffIdentifier: 2000 })
  })

  it('Get staff detail by username', async () => {
    get.mockResolvedValue({ nomsNumber: 'ABC1234' } as CommunityApiManagedOffender)

    const result = await communityApiClient.getStaffCaseload(2000)

    expect(get).toHaveBeenCalledWith({ path: '/secure/staff/staffIdentifier/2000/managedOffenders' })
    expect(result).toEqual({ nomsNumber: 'ABC1234' })
  })
})
