import { Request, Response } from 'express'
import roleCheckMiddleware from './roleCheckMiddleware'

let res = {} as unknown as Response
const req = {} as Request
const next = jest.fn()

const middleware = roleCheckMiddleware(['ROLE_LICENCE_RO'])

beforeEach(() => {
  jest.resetAllMocks()

  res = {
    redirect: jest.fn(),
    locals: {},
  } as unknown as Response
})

describe('roleCheckMiddleware', () => {
  it('should allow GET when user and allowed roles intersect', async () => {
    res = { ...res, locals: { user: { userRoles: ['ROLE_LICENCE_RO'] } } } as unknown as Response
    req.method = 'GET'
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
  })

  it('should deny GET when user and allowed roles do not intersect', async () => {
    req.method = 'GET'
    res = { ...res, locals: { user: { userRoles: ['ROLE_LICENCE_DM'] } } } as unknown as Response
    middleware(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(next).not.toBeCalled()
  })

  it('should allow POST when user and allowed roles intersect', async () => {
    res = { ...res, locals: { user: { userRoles: ['ROLE_LICENCE_RO'] } } } as unknown as Response
    req.method = 'POST'
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
  })

  it('should deny POST when user and allowed roles do not intersect', async () => {
    req.method = 'POST'
    res = { ...res, locals: { user: { userRoles: ['ROLE_LICENCE_DM'] } } } as unknown as Response
    middleware(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(next).not.toBeCalled()
  })
})
