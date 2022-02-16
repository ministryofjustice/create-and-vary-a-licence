import { Request, Response } from 'express'
import fetchLicence from './fetchLicenceMiddleware'
import LicenceService from '../services/licenceService'
import { Licence } from '../@types/licenceApiClientTypes'

jest.mock('../services/licenceService')

let res = {} as unknown as Response
const req = {
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

const probationRes = {
  locals: {
    user: {
      username: 'YY',
      deliusStaffIdentifier: 123,
      probationAreaCode: 'N55',
      probationTeamCodes: ['N55A'],
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

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

const middleware = fetchLicence(licenceService)

beforeEach(() => {
  req.params = { licenceId: '1' }
  res = prisonRes
  res.locals.licence = undefined
  licenceService.getLicence.mockResolvedValue(licence)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('fetchLicenceMiddleware', () => {
  it('should not read from licence api if route params does not contain licenceId', async () => {
    req.params = {}
    await middleware(req, res, next)
    expect(res.locals.licence).toBeUndefined()
    expect(licenceService.getLicence).not.toBeCalled()
    expect(next).toBeCalledTimes(1)
  })

  it('should populate licence from the API', async () => {
    await middleware(req, res, next)
    expect(res.locals.licence).toEqual(licence)
    expect(licenceService.getLicence).toBeCalledTimes(1)
    expect(next).toBeCalledTimes(1)
  })

  it('should handle error from licence service', async () => {
    licenceService.getLicence.mockRejectedValue('Error')

    await middleware(req, res, next)
    expect(next).toBeCalledWith('Error')
  })

  it('should allow access for a prison user based on caseload', async () => {
    await middleware(req, res, next)
    expect(res.locals.licence).toEqual(licence)
    expect(licenceService.getLicence).toBeCalledTimes(1)
    expect(next).toBeCalledTimes(1)
  })

  it('should deny access for a prison user based on caseload', async () => {
    res.locals.user.prisonCaseload = ['WRONG', 'STILL-WRONG']
    await middleware(req, res, next)
    expect(res.locals.licence).toBeUndefined()
    expect(licenceService.getLicence).toBeCalledTimes(1)
    expect(res.redirect).toBeCalledWith('/access-denied')
    expect(next).not.toBeCalled()
  })

  it('should allow access for a probation user based on teams', async () => {
    res = probationRes
    res.locals.licence = undefined
    await middleware(req, res, next)
    expect(res.locals.licence).toEqual(licence)
    expect(licenceService.getLicence).toBeCalledTimes(1)
    expect(next).toBeCalledTimes(1)
  })

  it('should deny access for a probation user based on teams', async () => {
    res = probationRes
    res.locals.licence = undefined
    res.locals.user.probationTeamCodes = ['WRONG', 'WRONG-AGAIN']
    await middleware(req, res, next)
    expect(res.locals.licence).toBeUndefined()
    expect(licenceService.getLicence).toBeCalledTimes(1)
    expect(res.redirect).toBeCalledWith('/access-denied')
    expect(next).not.toBeCalled()
  })
})
