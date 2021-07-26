import nock from 'nock'
import config from '../config'
import PrisonerService from '../services/prisonerService'
import HmppsAuthClient from './hmppsAuthClient'
import { PrisonerDetail } from './prisonClientTypes'

jest.mock('./hmppsAuthClient')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const prisonerService = new PrisonerService(hmppsAuthClient)
const stubbedPrisonerData = {
  offenderNo: 'A1234AA',
  title: 'Mr',
  firstName: 'Ringo',
  lastName: 'Starr',
  sexCode: 'M',
  currentlyInPrison: 'Y',
  latestLocationId: 'LEI',
  pncNumber: '2014/12344',
  croNumber: 'CR11111',
} as PrisonerDetail

describe('Prison API client tests', () => {
  let fakeApi: nock.Scope

  beforeEach(() => {
    config.apis.prisonApi.url = 'http://localhost:8100'
    fakeApi = nock(config.apis.prisonApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('Prisoner detail', () => {
    it('Get prisoner detail', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/api/offenders/AA1234A', '').reply(200, stubbedPrisonerData)
      const data = await prisonerService.getPrisonerDetail('XTEST1', 'AA1234A')
      expect(data).toEqual(stubbedPrisonerData)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('No client token', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.get('/api/offenders/AA1234A', '').reply(401)
      try {
        await prisonerService.getPrisonerDetail('XTEST1', 'AA1234A')
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Not found', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/api/offenders/AA1234A', '').reply(404)
      try {
        await prisonerService.getPrisonerDetail('XTEST1', 'AA1234A')
      } catch (e) {
        expect(e.message).toContain('Not Found')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })
})
