import { Request, Response } from 'express'
import fetchLicence from './fetchLicenceMiddleware'
import LicenceService from '../services/licenceService'
import { Licence } from '../data/licenceApiClientTypes'

jest.mock('../services/licenceService')

const req = {} as Request
const res = { locals: { user: { username: '' } } } as unknown as Response
const next = jest.fn()
const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>

const middleware = fetchLicence(licenceService)

beforeEach(() => {
  req.method = 'GET'
  req.params = {
    licenceId: '1',
  }
  res.locals.licence = undefined
  licenceService.getLicence.mockResolvedValue({ licenceId: '1' } as unknown as Licence)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('fetchLicenceMiddleware', () => {
  it('should not read from licence api if request method is not GET', async () => {
    req.method = 'POST'

    await middleware(req, res, next)
    expect(res.locals.licence).toBeUndefined()
    expect(licenceService.getLicence).toBeCalledTimes(0)
    expect(next).toBeCalledTimes(1)
  })

  it('should not read from licence api if route params not contains licenceId', async () => {
    req.params = {}

    await middleware(req, res, next)
    expect(res.locals.licence).toBeUndefined()
    expect(licenceService.getLicence).toBeCalledTimes(0)
    expect(next).toBeCalledTimes(1)
  })

  it('should populate locals with licence from API', async () => {
    await middleware(req, res, next)
    expect(res.locals.licence).toEqual({ licenceId: '1' })
    expect(licenceService.getLicence).toBeCalledTimes(1)
    expect(next).toBeCalledTimes(1)
  })
})
