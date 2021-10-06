import nock from 'nock'
import config from '../config'
import PrisonRegisterService from '../services/prisonRegisterService'
import HmppsAuthClient from './hmppsAuthClient'
import type { PrisonDto } from '../@types/prisonRegisterTypes'

jest.mock('./hmppsAuthClient')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)

const prisonDto = {
  prisonId: 'LEI',
  prisonName: 'Leeds HMP',
  active: true,
} as PrisonDto

describe('Prison register client', () => {
  let fakeApi: nock.Scope
  const username = 'joebloggs'
  const prisonCode = 'LEI'

  beforeEach(() => {
    config.apis.prisonRegisterApi.url = 'http://localhost:8100'
    fakeApi = nock(config.apis.prisonRegisterApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('Get prison description', () => {
    it('Valid request - with or without a token (insecure endpoint)', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get(`/prisons/id/${prisonCode}`).reply(200, prisonDto)
      const data = await prisonRegisterService.getPrisonDescription(username, prisonCode)
      expect(data).toEqual(prisonDto)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Invalid prison code', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get(`/prisons/id/${prisonCode}`).reply(404)
      try {
        await prisonRegisterService.getPrisonDescription(username, prisonCode)
      } catch (e) {
        expect(e.message).toContain('Not Found')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })

  describe('Get OMU contact email', () => {
    it('Valid request', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi
        .get(`/secure/prisons/id/${prisonCode}/offender-management-unit/email-address`)
        .reply(200, 'omu-email@address.com')
      const data = await prisonRegisterService.getPrisonOmuContactEmail(username, prisonCode)

      // Needs to call toString() on the response type to get the string value of the buffer returned.
      expect(data.toString()).toEqual('omu-email@address.com')
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('No client token - secure endpoint should fail', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.get(`/secure/prisons/id/${prisonCode}/offender-management-unit/email-address`).reply(401)
      try {
        await prisonRegisterService.getPrisonOmuContactEmail(username, prisonCode)
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Invalid prison code', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get(`/secure/prisons/id/${prisonCode}/offender-management-unit/email-address`).reply(404)
      try {
        await prisonRegisterService.getPrisonOmuContactEmail(username, prisonCode)
      } catch (e) {
        expect(e.message).toContain('Not Found')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })
})
