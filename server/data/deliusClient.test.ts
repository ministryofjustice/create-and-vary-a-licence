import HmppsRestClient from './hmppsRestClient'
import DeliusClient from './deliusClient'
import { DeliusManager, DeliusPDUHead, DeliusStaff } from '../@types/deliusClientTypes'
import { InMemoryTokenStore } from './tokenStore'

const deliusClient = new DeliusClient(
  new InMemoryTokenStore(async _username => ({ token: 'token-1', expiresIn: 1234 })),
)

describe('Delius client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')
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
    get.mockResolvedValue({ id: 2000 } as DeliusStaff)

    const result = await deliusClient.getStaffDetailByUsername('joebloggs')

    expect(get).toHaveBeenCalledWith({ path: `/staff/joebloggs` })
    expect(result).toEqual({ id: 2000 })
  })

  it('Get staff detail by staff code', async () => {
    get.mockResolvedValue({ id: 2000 } as DeliusStaff)

    const result = await deliusClient.getStaffDetailByStaffCode('staff-code')

    expect(get).toHaveBeenCalledWith({ path: `/staff/bycode/staff-code` })
    expect(result).toEqual({ id: 2000 })
  })

  it('Assign Delius role', async () => {
    await deliusClient.assignDeliusRole('username')

    expect(put).toHaveBeenCalledWith({ path: `/users/username/roles` })
  })

  it('Get PDU heads', async () => {
    get.mockResolvedValue([{ name: { forename: 'a' } }, { name: { forename: 'b' } }] as DeliusPDUHead[])

    const result = await deliusClient.getPduHeads('pdu-code')

    expect(get).toHaveBeenCalledWith({ path: `/staff/pdu-code/pdu-head` })
    expect(result).toEqual([{ name: { forename: 'a' } }, { name: { forename: 'b' } }])
  })

  it('Get responsible community manager', async () => {
    get.mockResolvedValue({ id: 2000 } as DeliusManager)

    const result = await deliusClient.getResponsibleCommunityManager('crn')

    expect(get).toHaveBeenCalledWith({ path: `/probation-case/crn/responsible-community-manager`, return404: true })
    expect(result).toEqual({ id: 2000 })
  })

  it('handle 404 when getting responsible community manager', async () => {
    get.mockResolvedValue(null)

    const result = await deliusClient.getResponsibleCommunityManager('crn-not-found')

    expect(get).toHaveBeenCalledWith({
      path: `/probation-case/crn-not-found/responsible-community-manager`,
      return404: true,
    })
    expect(result).toBeNull()
  })
})
