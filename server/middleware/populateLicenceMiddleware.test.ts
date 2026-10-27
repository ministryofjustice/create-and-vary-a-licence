import { Request, Response } from 'express'
import LicenceService from '../services/licenceService'
import { Licence } from '../@types/licenceApiClientTypes'
import populateLicenceMiddleware from './populateLicenceMiddleware'

jest.mock('../services/licenceService')

let res = {} as unknown as Response
const req = {
  method: 'GET',
  baseUrl: '',
  path: '/licence/create/id/1/check-your-answers',
} as Request
const next = jest.fn()

const prisonRes = {
  locals: {
    user: {
      username: 'XX',
      nomisStaffId: 123,
      prisonCaseload: ['LEI', 'MDI'],
    },
    licence: undefined,
  },
  redirect: jest.fn(),
} as unknown as Response

const licence = {
  id: '1',
  statusCode: 'IN_PROGRESS',
  prisonCode: 'LEI',
  probationAreaCode: 'N55',
  probationTeamCode: 'N55A',
} as unknown as Licence

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

const middleware = populateLicenceMiddleware(licenceService)

beforeEach(() => {
  req.params = { licenceId: '1' }
  res = prisonRes
  res.locals.licence = undefined
  licenceService.getLicence.mockResolvedValue(licence)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('populateLicenceMiddleware', () => {
  it('should not get licence if route params do not contain licenceId', async () => {
    const noLicenceRequest = {
      ...req,
      path: '/licence/vary/caseload',
    } as Request

    await middleware(noLicenceRequest, res, next)

    expect(res.locals.licence).toBeUndefined()
    expect(licenceService.getLicence).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should populate licence if the route params contain licenceId', async () => {
    await middleware(req, res, next)

    expect(res.locals.licence).toEqual(licence)
    expect(licenceService.getLicence).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
