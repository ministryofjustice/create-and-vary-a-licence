import { Request, Response } from 'express'
import roleCheckMiddleware from './roleCheckMiddleware'
import AuditService from '../services/audit/auditService'

jest.mock('../services/audit/auditService')

let req: Request
let res: Response
const next = jest.fn()

const auditService = new AuditService(null) as jest.Mocked<AuditService>

const middleware = roleCheckMiddleware(auditService, [
  'ROLE_LICENCE_RO',
  'ROLE_LICENCE_ACO',
  'ROLE_LICENCE_READONLY',
  'ROLE_CVL_REPORTS',
])

beforeEach(() => {
  jest.resetAllMocks()
  req = {
    params: {
      nomisId: 'A1234BC',
    },
    path: '/licence/create/nomisId/A1234BC/confirm',
  } as unknown as Request

  res = {
    locals: {
      user: {
        username: 'YY',
        deliusStaffIdentifier: 123,
        userRoles: ['ROLE_LICENCE_RO'],
      },
    },
    redirect: jest.fn(),
  } as unknown as Response
})

describe('roleCheckMiddleware', () => {
  it('should call next if user roles are allowed access', async () => {
    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it(`should redirect to access denied if user doesn't have a required role`, async () => {
    res.locals.user.userRoles = ['ROLE_NOT_ALLOWED']

    await middleware(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
  })
})
