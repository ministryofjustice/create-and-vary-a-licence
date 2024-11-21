import { Readable } from 'stream'

import request from 'supertest'
import { Express } from 'express'
import PrisonerService from '../services/prisonerService'

import { appWithAllRoutes, user } from './__testutils/appSetup'

const image = {}

let app: Express
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

beforeEach(() => {
  app = appWithAllRoutes({ services: { prisonerService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoners/prisonNumber/image', () => {
  it('should call getImage method correctly', () => {
    prisonerService.getPrisonerImage = jest
      .fn()
      .mockImplementation()
      .mockResolvedValue(image as Readable)
    return request(app)
      .get('/prisoner/A12345/image')
      .expect('Content-Type', 'image/jpeg')
      .expect(res => {
        expect(prisonerService.getPrisonerImage).toHaveBeenCalledWith('A12345', user)
      })
  })

  it('should return placeholder image if error retrieving photo from api', () => {
    prisonerService.getPrisonerImage = jest.fn().mockImplementation().mockRejectedValue(new Error())
    return request(app)
      .get('/prisoner/X54321/image')
      .expect('Content-Type', 'image/png')
      .expect(res => {
        expect(res.status).toEqual(200)
      })
  })
})
