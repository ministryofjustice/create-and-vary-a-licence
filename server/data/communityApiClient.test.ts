import nock from 'nock'
import config from '../config'
import { ManagedOffender } from './communityClientTypes'
import CommunityService from '../services/communityService'
import HmppsAuthClient from './hmppsAuthClient'

jest.mock('./hmppsAuthClient')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const stubbedManagedOffenders: ManagedOffender[] = [
  {
    crnNumber: 'CRN001',
    currentOm: true,
    currentPom: false,
    currentRo: true,
    nomsNumber: 'A1234AA',
    offenderSurname: 'McCartney',
    omEndDate: '12/12/2021',
    omStartDate: '01/12/2021',
    staffCode: 'ST0001',
    staffIdentifier: 1234,
  } as ManagedOffender,
]

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
      const data = await communityService.getManagedOffenders('XTEST1', 1234)
      expect(data).toEqual(stubbedManagedOffenders)
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('No client token', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('')
      fakeApi.get('/secure/staff/staffIdentifier/1234/managedOffenders', '').reply(401)
      try {
        await communityService.getManagedOffenders('XTEST1', 1234)
      } catch (e) {
        expect(e.message).toContain('Unauthorized')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Empty caseload', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/secure/staff/staffIdentifier/1234/managedOffenders', '').reply(200, [])
      const data = await communityService.getManagedOffenders('XTEST1', 1234)
      expect(data).toEqual([])
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })

    it('Staff code not found', async () => {
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a token')
      fakeApi.get('/secure/staff/staffIdentifier/1234/managedOffenders', '').reply(404)
      try {
        await communityService.getManagedOffenders('XTEST1', 1234)
      } catch (e) {
        expect(e.message).toContain('Not Found')
      }
      expect(nock.isDone()).toBe(true)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
    })
  })
})
