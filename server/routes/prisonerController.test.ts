import { Readable } from 'stream'

import request from 'supertest'
import { Express } from 'express'
import PrisonerService from '../services/prisonerService'

import { appWithAllRoutes, user } from './__testutils/appSetup'

jest.mock('../services/prisonerService')

const image = {}

let app: Express
let prisonerService: jest.Mocked<PrisonerService>

beforeEach(() => {
  prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  app = appWithAllRoutes({ services: { prisonerService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoners/prisonNumber/image', () => {
  it('should call getImage method correctly', () => {
    prisonerService.getPrisonerImage.mockResolvedValue(image as Readable)
    return request(app)
      .get('/prisoner/A12345/image')
      .expect('Content-Type', 'image/jpeg')
      .expect(_res => {
        expect(prisonerService.getPrisonerImage).toHaveBeenCalledWith('A12345', user)
      })
  })

  it('should return placeholder image if error retrieving photo from api', () => {
    prisonerService.getPrisonerImage.mockRejectedValue(new Error())
    return request(app)
      .get('/prisoner/X54321/image')
      .expect('Content-Type', 'image/png')
      .expect(res => {
        expect(res.status).toEqual(200)
      })
  })
})
