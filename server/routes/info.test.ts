import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from './__testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /info', () => {
  it('should serve info endpoint', () => {
    return request(app)
      .get('/info')
      .expect('Content-Type', /application\/json/)
      .expect(res => {
        expect(res.body).toStrictEqual({
          build: {
            artifact: 'test',
            name: 'test',
            version: '1',
          },
          git: {
            branch: 'main',
          },
          productId: 'DPS01',
        })
      })
  })
})
