import request from 'supertest'
import type { Express } from 'express'
import { appWithAllRoutes } from './testutils/appSetup'
import LicenceService from '../services/licenceService'
import CommunityService from '../services/communityService'
import PrisonerService from '../services/prisonerService'
import { AuthRole } from '../middleware/authorisationMiddleware'
import UserService, { UserDetails } from '../services/userService'
import { TestData } from '../data/licenceClientTypes'
import { PrisonerDetail } from '../data/prisonClientTypes'
import { StaffDetail, ManagedOffender } from '../data/communityClientTypes'

jest.mock('../services/userService')
jest.mock('../services/licenceService')
jest.mock('../services/communityService')
jest.mock('../services/prisonerService')

const userService = new UserService(null) as jest.Mocked<UserService>
const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>
const communityService = new CommunityService(null) as jest.Mocked<CommunityService>
const prisonerService = new PrisonerService(null) as jest.Mocked<PrisonerService>

let app: Express

const stubbedUserDetails: UserDetails = {
  name: 'John Smith',
  displayName: 'J. Smith',
}

const stubbedStaffDetail = {
  staff: { forenames: 'John', surname: 'Lennon' },
  staffCode: 'JL1',
  staffIdentifier: 1234,
  teams: [{ code: 'T1', description: 'Team Beatles', emailAddress: 'team@beatles.com' }],
  email: 'john.lennon@beatles.com',
  telephoneNumber: '0161 232232',
  username: 'JL001',
} as StaffDetail

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

const stubbedLicenceData: TestData[] = [{ key: 'GH', value: 'George Harrison' }]

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

beforeEach(() => {
  app = appWithAllRoutes({ userService, prisonerService, licenceService, communityService }, [AuthRole.OMU])
  userService.getUser.mockResolvedValue(stubbedUserDetails)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Community routes', () => {
  it('GET /staff/:username/detail should return staff detail', () => {
    communityService.getStaffDetail.mockResolvedValue(stubbedStaffDetail)
    return request(app)
      .get('/staff/user1/detail')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('john.lennon@beatles.com')
      })
  })

  it('GET /staff/:staffId/caseload should return caseload', () => {
    communityService.getManagedOffenders.mockResolvedValue(stubbedManagedOffenders)
    return request(app)
      .get('/staff/user1/caseload')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('McCartney')
      })
  })
})

describe('Licence routes', () => {
  it('GET /test/data should return test data list', () => {
    licenceService.getTestData.mockResolvedValue(stubbedLicenceData)
    return request(app)
      .get('/test/data')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('George Harrison')
      })
  })
})

describe('Prisoner routes', () => {
  it('GET /prisoner/:nomsId/detail should return prisoner detail', () => {
    prisonerService.getPrisonerDetail.mockResolvedValue(stubbedPrisonerData)
    return request(app)
      .get('/prisoner/A1234AA/detail')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('A1234AA')
        expect(res.text).toContain('Ringo')
        expect(res.text).toContain('Starr')
      })
  })
})
