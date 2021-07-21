import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Create and vary a licence')
        expect(res.text).toContain('Create a licence')
        expect(res.text).toContain('View or print a licence')
        expect(res.text).toContain('Approve a licence')
        expect(res.text).toContain('Request a licence')
        expect(res.text).toContain('Approve bespoke terms')
      })
  })
})
