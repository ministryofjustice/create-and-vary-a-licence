import nock from 'nock'
import config from '../config'
import PrisonerService from '../services/prisonerService'
import HmppsAuthClient from './hmppsAuthClient'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'

jest.mock('./hmppsAuthClient')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const prisonerService = new PrisonerService(hmppsAuthClient)

const stubbedSearchResult = [
  { firstName: 'Bob', lastName: 'Smith', prisonerNumber: 'A1234AA' },
  { firstName: 'Bob', lastName: 'Jones', prisonerNumber: 'A1234AB' },
] as Prisoner[]

describe('Prisoner search API client tests', () => {
  let fakeApi: nock.Scope

  beforeEach(() => {
    config.apis.prisonerSearchApi.url = 'http://localhost:8100'
    fakeApi = nock(config.apis.prisonerSearchApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('Search for  prisoner', () => {
    const searchCriteria = {
      firstName: 'Bob',
      includeAliases: false,
      includeRestrictivePatients: false,
    } as PrisonerSearchCriteria

    it('Get search results', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.post('/prisoner-search/match-prisoners', searchCriteria).reply(200, stubbedSearchResult)
      const data = await prisonerService.searchPrisoners('user1', searchCriteria)
      expect(data).toEqual(stubbedSearchResult)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Search - with no client token', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.post('/prisoner-search/match-prisoners', searchCriteria).reply(401)
      try {
        await prisonerService.searchPrisoners('user1', searchCriteria)
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Search - no matches', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.post('/prisoner-search/match-prisoners', searchCriteria).reply(200, [])
      const data = await prisonerService.searchPrisoners('user1', searchCriteria)
      expect(data).toEqual([])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })

  describe('Search prisoners by list of nomisIds', () => {
    const searchCriteria = ['A1234AA', 'A1234AB']

    it('Get search results', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi
        .post('/prisoner-search/prisoner-numbers', { prisonerNumbers: searchCriteria })
        .reply(200, stubbedSearchResult)
      const data = await prisonerService.searchPrisonersByNomisIds('user1', searchCriteria)
      expect(data).toEqual(stubbedSearchResult)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Search - with no client token', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.post('/prisoner-search/prisoner-numbers', { prisonerNumbers: searchCriteria }).reply(401)
      try {
        await prisonerService.searchPrisonersByNomisIds('user1', searchCriteria)
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Search - no matches', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.post('/prisoner-search/prisoner-numbers', { prisonerNumbers: searchCriteria }).reply(200, [])
      const data = await prisonerService.searchPrisonersByNomisIds('user1', searchCriteria)
      expect(data).toEqual([])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })
})
