import { Readable } from 'stream'
import { Buffer } from 'buffer'
import HmppsRestClient from './hmppsRestClient'
import PrisonApiClient from './prisonApiClient'
import { User } from '../@types/CvlUserDetails'
import { InMemoryTokenStore } from './tokenStore'

const prisonApiClient = new PrisonApiClient(
  new InMemoryTokenStore(async _username => ({ token: 'token-1', expiresIn: 1234 })),
)

describe('Prison Api client tests', () => {
  const get = jest.spyOn(HmppsRestClient.prototype, 'get')
  const post = jest.spyOn(HmppsRestClient.prototype, 'post')
  const stream = jest.spyOn(HmppsRestClient.prototype, 'stream')

  beforeEach(() => {
    get.mockResolvedValue(true)
    post.mockResolvedValue(true)
    stream.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Get prisoner image', async () => {
    stream.mockResolvedValue(Readable.from('image'))

    const result = await prisonApiClient.getPrisonerImage('ABC1234', { username: 'joebloggs' } as User)

    expect(stream).toHaveBeenCalledWith(
      { path: '/api/bookings/offenderNo/ABC1234/image/data' },
      { username: 'joebloggs' },
    )
    expect(result.read()).toEqual('image')
  })

  it('Get prisoner image as JPEG', async () => {
    get.mockResolvedValue(Buffer.from('image'))

    const result = await prisonApiClient.getPrisonerImageData('ABC1234', { username: 'joebloggs' } as User)

    expect(get).toHaveBeenCalledWith(
      { path: '/api/bookings/offenderNo/ABC1234/image/data', responseType: 'image/jpeg' },
      { username: 'joebloggs' },
    )
    expect(result.toString()).toEqual('image')
  })

  it('Get prisoner detail', async () => {
    get.mockResolvedValue({ bookingId: '123', agencyId: 'MDI' })

    const result = await prisonApiClient.getPrisonerDetail('ABC1234', { username: 'joebloggs' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/api/offenders/ABC1234' }, { username: 'joebloggs' })
    expect(result).toEqual({ bookingId: '123', agencyId: 'MDI' })
  })

  it('Gets prisoner sentences and offences', async () => {
    const bookingId = 123
    const sentencesAndOffences = { bookingId, sentenceDate: '2023-04-27"' }

    get.mockResolvedValue(sentencesAndOffences)
    const user = { username: 'CVL user' } as User
    const result = await prisonApiClient.getPrisonerSentenceAndOffences(bookingId, user)

    expect(get).toHaveBeenCalledWith(
      { path: `/api/offender-sentences/booking/${bookingId}/sentences-and-offences` },
      user,
    )
    expect(result).toEqual(sentencesAndOffences)
  })

  it('Get prison information', async () => {
    get.mockResolvedValue({ description: 'Moorland (HMP)' })

    const result = await prisonApiClient.getPrisonInformation('MDI', { username: 'joebloggs' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/api/agencies/prison/MDI' }, { username: 'joebloggs' })
    expect(result).toEqual({ description: 'Moorland (HMP)' })
  })

  it('Get latest HDC status', async () => {
    get.mockResolvedValue({ approvalStatus: 'APPROVED' })

    const result = await prisonApiClient.getLatestHdcStatus('1234', { username: 'joebloggs' } as User)

    expect(get).toHaveBeenCalledWith(
      { path: '/api/offender-sentences/booking/1234/home-detention-curfews/latest', return404: true },
      { username: 'joebloggs' },
    )
    expect(result).toEqual({ approvalStatus: 'APPROVED' })
  })

  it('Get latest HDC status handles null responses', async () => {
    get.mockResolvedValue(null)

    const result = await prisonApiClient.getLatestHdcStatus('1234', { username: 'joebloggs' } as User)

    expect(get).toHaveBeenCalledWith(
      { path: '/api/offender-sentences/booking/1234/home-detention-curfews/latest', return404: true },
      { username: 'joebloggs' },
    )
    expect(result).toEqual(null)
  })

  it('Get latest HDC status batch', async () => {
    post.mockResolvedValue([{ approvalStatus: 'APPROVED' }])

    const result = await prisonApiClient.getLatestHdcStatusBatch([1234], { username: 'joebloggs' } as User)

    expect(post).toHaveBeenCalledWith(
      { path: '/api/offender-sentences/home-detention-curfews/latest', data: [1234] },
      { username: 'joebloggs' },
    )
    expect(result).toEqual([{ approvalStatus: 'APPROVED' }])
  })

  it('Get prison user', async () => {
    get.mockResolvedValue({ firstName: 'Joe', lastName: 'Bloggs' })

    const result = await prisonApiClient.getUser({ token: 'token' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/api/users/me' }, { token: 'token' })
    expect(result).toEqual({ firstName: 'Joe', lastName: 'Bloggs' })
  })

  it('Get user caseloads', async () => {
    get.mockResolvedValue([{ description: 'Caseload 1' }])

    const result = await prisonApiClient.getUserCaseloads({ token: 'token' } as User)

    expect(get).toHaveBeenCalledWith({ path: '/api/users/me/caseLoads' }, { token: 'token' })
    expect(result).toEqual([{ description: 'Caseload 1' }])
  })
})
