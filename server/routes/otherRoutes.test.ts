import request from 'supertest'
import type { Express } from 'express'
import { appWithAllRoutes } from './testutils/appSetup'
import LicenceService from '../services/licenceService'
import CommunityService from '../services/communityService'
import PrisonerService from '../services/prisonerService'
import { AuthRole } from '../middleware/authorisationMiddleware'
import UserService, { UserDetails } from '../services/userService'
import { TestData } from '../data/licenceClientTypes'
import { PrisonApiPrisoner, PrisonApiSentenceDetail } from '../data/prisonClientTypes'
import {
  CommunityApiStaffDetails,
  CommunityApiManagedOffender,
  CommunityApiTeam,
  CommunityApiHuman,
} from '../data/communityClientTypes'

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
  staff: { forenames: 'John', surname: 'Lennon' } as CommunityApiHuman,
  staffCode: 'JL1',
  staffIdentifier: 1234,
  teams: [{ code: 'T1', description: 'Team Beatles', emailAddress: 'team@beatles.com' } as CommunityApiTeam],
  email: 'john.lennon@beatles.com',
  telephoneNumber: '0161 232232',
  username: 'JL001',
} as CommunityApiStaffDetails

const stubbedManagedOffenders = [
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

const stubbedLicenceData: TestData[] = [{ key: 'GH', value: 'George Harrison' }]

const stubbedPrisonerData = {
  offenderNo: 'A1234AA',
  firstName: 'Ringo',
  lastName: 'Starr',
  latestLocationId: 'LEI',
  locationDescription: 'Inside - Leeds HMP',
  dateOfBirth: '24/06/2000',
  age: 21,
  activeFlag: true,
  legalStatus: 'REMAND',
  category: 'Cat C',
  imprisonmentStatus: 'LIFE',
  imprisonmentStatusDescription: 'Serving Life Imprisonment',
  religion: 'Christian',
  sentenceDetail: {
    sentenceStartDate: '12/12/2019',
    additionalDaysAwarded: 4,
    tariffDate: '12/12/2030',
    releaseDate: '12/12/2028',
    conditionalReleaseDate: '12/12/2025',
    confirmedReleaseDate: '12/12/2026',
    sentenceExpiryDate: '16/12/2030',
    licenceExpiryDate: '16/12/2030',
  } as PrisonApiSentenceDetail,
} as PrisonApiPrisoner

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
    prisonerService.getPrisonerImage.mockResolvedValue(null)
    return request(app)
      .get('/prisoner/A1234AA/detail')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('A1234AA')
        expect(res.text).toContain('Ringo')
        expect(res.text).toContain('Starr')
        expect(res.text).toContain('12/12/2019') // sentence start
        expect(res.text).toContain('12/12/2025') // conditional release
        expect(res.text).toContain('16/12/2030') // licence expiry
      })
  })
})
