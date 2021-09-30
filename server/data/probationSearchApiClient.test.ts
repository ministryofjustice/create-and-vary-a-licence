import nock from 'nock'
import config from '../config'
import CommunityService from '../services/communityService'
import HmppsAuthClient from './hmppsAuthClient'
import type { OffenderDetail, SearchDto } from './probationSearchApiClientTypes'

jest.mock('./hmppsAuthClient')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const communityService = new CommunityService(hmppsAuthClient)

const searchCriteria = {
  firstName: 'Bob',
  includeAliases: false,
  includeRestrictivePatients: false,
} as SearchDto

const stubbedSearchResult = [
  { firstName: 'Bob', surname: 'Smith', offenderId: 3333333 },
  { firstName: 'Bob', surname: 'Jones', offenderId: 2222222 },
] as OffenderDetail[]

describe('Probation search API client', () => {
  let fakeApi: nock.Scope

  beforeEach(() => {
    config.apis.probationSearchApi.url = 'http://localhost:8100'
    fakeApi = nock(config.apis.probationSearchApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('Search in probation', () => {
    it('Get search results', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.post('/search', searchCriteria).reply(200, stubbedSearchResult)
      const data = await communityService.searchProbationers(searchCriteria)
      expect(data).toEqual(stubbedSearchResult)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Search - with no client token', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.post('/search', searchCriteria).reply(401)
      try {
        await communityService.searchProbationers(searchCriteria)
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Search - no matches', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.post('/search', searchCriteria).reply(200, [])
      const data = await communityService.searchProbationers(searchCriteria)
      expect(data).toEqual([])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })
})
