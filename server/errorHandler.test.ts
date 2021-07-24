import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from './routes/testutils/appSetup'
import PrisonerService from './services/prisonerService'
import LicenceService from './services/licenceService'
import CommunityService from './services/communityService'
import { AuthRole } from './middleware/authorisationMiddleware'

jest.mock('./services/prisonerService')
jest.mock('./services/licenceService')
jest.mock('./services/communityService')

const prisonerService = new PrisonerService(null) as jest.Mocked<PrisonerService>
const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>
const communityService = new CommunityService(null) as jest.Mocked<CommunityService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ prisonerService, licenceService, communityService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content with stack in dev mode', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('NotFoundError: Not found')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render content without stack in production mode', () => {
    return request(appWithAllRoutes({ prisonerService, licenceService, communityService }, [AuthRole.OMU], true))
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Something went wrong. The error has been logged. Please try again')
        expect(res.text).not.toContain('NotFoundError: Not found')
      })
  })
})
