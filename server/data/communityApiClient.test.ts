import nock from 'nock'
import config from '../config'
import { CommunityApiStaffDetails, CommunityApiManagedOffender } from '../@types/communityClientTypes'
import CommunityService from '../services/communityService'
import HmppsAuthClient from './hmppsAuthClient'

jest.mock('./hmppsAuthClient')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const stubbedManagedOffenders: CommunityApiManagedOffender[] = [
  {
    crnNumber: 'CRN001',
    currentOm: true,
    currentPom: false,
    currentRo: true,
    nomsNumber: 'A1234AA',
    offenderSurname: 'McCartney',
    staffCode: 'ST0001',
    staffIdentifier: 1234,
  } as CommunityApiManagedOffender,
]

const stubbedStaffDetails: CommunityApiStaffDetails = {
  email: 'test@test.com',
  staff: { forenames: 'Test test', surname: 'Test' },
  staffCode: 'X400',
  staffIdentifier: 1234,
  telephoneNumber: '0111 1111111',
  username: 'TestUserNPS',
}

const communityService = new CommunityService(hmppsAuthClient)

describe('Community API client tests', () => {
  let fakeApi: nock.Scope

  beforeEach(() => {
    config.apis.communityApi.url = 'http://localhost:8100'
    fakeApi = nock(config.apis.communityApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('Get the caseload for a probation officer', () => {
    it('Get managed cases', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/secure/staff/staffIdentifier/1234/managedOffenders', '').reply(200, stubbedManagedOffenders)
      const data = await communityService.getManagedOffenders(1234)
      expect(data).toEqual(stubbedManagedOffenders)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('No client token', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.get('/secure/staff/staffIdentifier/1234/managedOffenders', '').reply(401)
      try {
        await communityService.getManagedOffenders(1234)
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Empty caseload', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/secure/staff/staffIdentifier/1234/managedOffenders', '').reply(200, [])
      const data = await communityService.getManagedOffenders(1234)
      expect(data).toEqual([])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Staff code not found', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/secure/staff/staffIdentifier/1111/managedOffenders', '').reply(404)
      try {
        await communityService.getManagedOffenders(1111)
      } catch (e) {
        expect(e.message).toContain('Not Found')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })

  describe('Get staff details for a probation officer', () => {
    it('Get staff details', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/secure/staff/username/TestUserNPS', '').reply(200, stubbedStaffDetails)
      const data = await communityService.getStaffDetail('TestUserNPS')
      expect(data).toEqual(stubbedStaffDetails)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })
})
