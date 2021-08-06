import request from 'supertest'
import type { Express } from 'express'
import { appWithAllRoutes } from './testutils/appSetup'
import LicenceService from '../services/licenceService'
import CommunityService from '../services/communityService'
import PrisonerService from '../services/prisonerService'
import { AuthRole } from '../middleware/authorisationMiddleware'
import UserService, { UserDetails } from '../services/userService'
import { CommunityApiManagedOffender } from '../data/communityClientTypes'

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

beforeEach(() => {
  app = appWithAllRoutes({ userService, prisonerService, licenceService, communityService }, [AuthRole.OMU])
  userService.getUser.mockResolvedValue(stubbedUserDetails)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Licence routes', () => {
  it('GET /licence/staffId/:staffId/caseload should return a caseload', () => {
    communityService.getManagedOffenders.mockResolvedValue(stubbedManagedOffenders)
    return request(app)
      .get('/licence/staffId/1234/caseload')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('McCartney')
      })
  })
})
