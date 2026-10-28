import { Request, Response } from 'express'
import fetchLicence from './fetchLicenceMiddleware'
import LicenceService from '../services/licenceService'
import { Licence } from '../@types/licenceApiClientTypes'

jest.mock('../services/licenceService')
jest.mock('../services/userService')

let res = {} as unknown as Response
const req = {
  path: '/licence/create/id/1/check-your-answers',
} as Request
const next = jest.fn()

const licence = {
  id: '1',
  statusCode: 'IN_PROGRESS',
  prisonCode: 'LEI',
  probationAreaCode: 'N55',
  probationTeamCode: 'N55A',
} as unknown as Licence

const prisonRes = {
  locals: {
    user: {
      username: 'XX',
      nomisStaffId: 123,
      prisonCaseload: ['LEI', 'MDI'],
    },
    licence,
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
      userRoles: ['ROLE_LICENCE_RO'],
    },
    licence,
  },
  redirect: jest.fn(),
} as unknown as Response

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

const middleware = fetchLicence(licenceService)

beforeEach(() => {
  req.params = { licenceId: '1' }
  res = prisonRes
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('fetchLicenceMiddleware', () => {
  it('should allow access for a prison user based on caseload', async () => {
    await middleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should deny access for a prison user based on caseload', async () => {
    res.locals.user.prisonCaseload = ['WRONG', 'STILL-WRONG']

    await middleware(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(next).not.toHaveBeenCalled()
  })

  it('should allow access for a probation user based on teams', async () => {
    res = probationRes

    await middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should deny access for a probation user based on teams', async () => {
    res = probationRes
    res.locals.user.probationTeamCodes = ['WRONG', 'WRONG-AGAIN']

    await middleware(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(next).not.toHaveBeenCalled()
  })

  it('should allow access for PDUH regardless of teams', async () => {
    res = probationRes
    res.locals.user.probationTeamCodes = ['WRONG', 'WRONG-AGAIN']
    res.locals.user.userRoles = ['ROLE_LICENCE_ACO'] // PDU role

    await middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should allow access for a probation user to a licence linked to a different team where a newer licence version is linked to their team ', async () => {
    res = probationRes
    res.locals.user = {
      ...res.locals.user,
      probationTeamCodes: ['N55A'],
      userRoles: ['ROLE_LICENCE_RO'],
    }
    res.locals.licence = {
      ...res.locals.licence,
      probationTeamCode: 'another-team',
    }

    licenceService.canComAccessLicence.mockResolvedValue(true)

    await middleware(req, res, next)

    expect(licenceService.canComAccessLicence).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
