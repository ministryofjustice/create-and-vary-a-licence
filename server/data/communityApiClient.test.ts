import HmppsRestClient from './hmppsRestClient'
import CommunityApiClient from './communityApiClient'
import {
  CommunityApiManagedOffender,
  CommunityApiOffenderManager,
  CommunityApiStaffDetails,
  CommunityApiUserDetails,
} from '../@types/communityClientTypes'
import { InMemoryTokenStore } from './tokenStore'

const communityApiClient = new CommunityApiClient(
  new InMemoryTokenStore(async _username => ({ token: 'token-1', expiresIn: 1234 }))
)

describe('Community Api client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')
  const post = jest.spyOn(HmppsRestClient.prototype, 'post')
  const put = jest.spyOn(HmppsRestClient.prototype, 'put')

  beforeEach(() => {
    get.mockResolvedValue(true)
    get.mockResolvedValue(true)
    put.mockResolvedValue(true)
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

  it('Get staff detail by staff code', async () => {
    get.mockResolvedValue({ staffIdentifier: 2000 } as CommunityApiStaffDetails)

    const result = await communityApiClient.getStaffDetailByStaffCode('X12345')

    expect(get).toHaveBeenCalledWith({ path: '/secure/staff/staffCode/X12345' })
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

  it('Get staff detail by list of usernames', async () => {
    post.mockResolvedValue([{ staffIdentifier: 2000 }] as CommunityApiStaffDetails[])

    const result = await communityApiClient.getStaffDetailByStaffCodeList(['X1234'])

    expect(post).toHaveBeenCalledWith({ path: '/secure/staff/list/staffCodes', data: ['X1234'] })
    expect(result).toEqual([{ staffIdentifier: 2000 }])
  })

  it('Get staff caseload', async () => {
    get.mockResolvedValue({ nomsNumber: 'ABC1234' } as CommunityApiManagedOffender)

    const result = await communityApiClient.getStaffCaseload(2000)

    expect(get).toHaveBeenCalledWith({
      path: '/secure/staff/staffIdentifier/2000/caseload/managedOffenders',
    })
    expect(result).toEqual({ nomsNumber: 'ABC1234' })
  })

  it('Get team caseload', async () => {
    get.mockResolvedValue({ offenderCrn: 'ABC1234' } as CommunityApiManagedOffender)

    const result = await communityApiClient.getTeamCaseload('teamA')

    expect(get).toHaveBeenCalledWith({
      path: '/secure/team/teamA/caseload/managedOffenders',
    })
    expect(result).toEqual({ offenderCrn: 'ABC1234' })
  })

  it(`Get a list of an offender's managers`, async () => {
    get.mockResolvedValue([{ staffId: 2000 }] as CommunityApiOffenderManager[])

    const result = await communityApiClient.getAnOffendersManagers('X1234')

    expect(get).toHaveBeenCalledWith({
      path: '/secure/offenders/crn/X1234/allOffenderManagers',
    })
    expect(result).toEqual([{ staffId: 2000 }])
  })

  it(`Get user details by username`, async () => {
    get.mockResolvedValue({
      enabled: true,
      firstName: 'X',
      surname: 'Y',
      userId: 1,
      roles: [{ name: 'ROLENAME' }],
    } as CommunityApiUserDetails)

    const result = await communityApiClient.getUserDetailsByUsername('deliusUsername')

    expect(get).toHaveBeenCalledWith({
      path: '/secure/users/deliusUsername/details',
    })
    expect(result).toEqual({ enabled: true, firstName: 'X', surname: 'Y', userId: 1, roles: [{ name: 'ROLENAME' }] })
  })

  it(`Assign delius role`, async () => {
    await communityApiClient.assignDeliusRole('deliusUsername', 'SOMEROLE')

    expect(put).toHaveBeenCalledWith({
      path: '/secure/users/deliusUsername/roles/SOMEROLE',
    })
  })

  it(`Get PDU heads`, async () => {
    await communityApiClient.getPduHeads('pduCode')

    expect(get).toHaveBeenCalledWith({
      path: '/secure/staff/pduHeads/pduCode',
    })
  })
})
