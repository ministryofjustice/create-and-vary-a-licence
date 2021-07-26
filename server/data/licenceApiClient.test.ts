import nock from 'nock'
import config from '../config'
import LicenceService from '../services/licenceService'
import HmppsAuthClient from './hmppsAuthClient'
import { TestData } from './licenceClientTypes'

jest.mock('./hmppsAuthClient')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const licenceService = new LicenceService(hmppsAuthClient)
const stubbedTestData: TestData[] = [{ key: 'X', value: 'Y' } as TestData]

describe('Licence API client tests', () => {
  let fakeApi: nock.Scope

  beforeEach(() => {
    config.apis.licenceApi.url = 'http://localhost:8100'
    fakeApi = nock(config.apis.licenceApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('Test data', () => {
    it('Get test data', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/test/data', '').reply(200, stubbedTestData)
      const data = await licenceService.getTestData('XTEST1')
      expect(data).toEqual(stubbedTestData)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('No client token', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.get('/test/data', '').reply(401)
      try {
        await licenceService.getTestData('XTEST1')
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Empty data', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/test/data', '').reply(200, [])
      const data = await licenceService.getTestData('XTEST1')
      expect(data).toEqual([])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })
})
