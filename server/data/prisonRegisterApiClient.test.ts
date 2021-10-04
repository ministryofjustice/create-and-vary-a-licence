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
    it('Valid request', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get(`/prisons/id/${prisonCode}`).reply(200, prisonDto)
      const data = await prisonRegisterService.getPrisonDescription(username, prisonCode)
      expect(data).toEqual(prisonDto)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('No client token', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.get(`/prisons/id/${prisonCode}`).reply(401)
      try {
        await prisonRegisterService.getPrisonDescription(username, prisonCode)
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
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
})
