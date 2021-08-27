import type { Request, Response } from 'express'

import { HTTPError } from 'superagent'
import createErrorHandler from './errorHandler'

describe('Error Handler', () => {
  let req: Request
  let res: Response
  let error: HTTPError

  beforeEach(() => {
    req = {} as Request

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
      status: jest.fn(),
      locals: {
        user: {
          username: 'user',
        },
      },
    } as unknown as Response
  })

  it('should log user out if error is 401', () => {
    const handler = createErrorHandler(false)

    error = {
      status: 401,
    } as HTTPError

    handler(error, req, res, jest.fn)

    expect(res.redirect).toHaveBeenCalledWith('/logout')
  })

  it('should log user out if error is 403', () => {
    const handler = createErrorHandler(false)

    error = {
      status: 403,
    } as HTTPError

    handler(error, req, res, jest.fn)

    expect(res.redirect).toHaveBeenCalledWith('/logout')
  })

  it('should render error page with stacktrace if not in production', () => {
    const handler = createErrorHandler(false)

    error = {
      status: 400,
      message: 'bad request',
      stack: 'stacktrace',
    } as HTTPError

    handler(error, req, res, jest.fn)

    expect(res.render).toHaveBeenCalledWith('pages/error', {
      message: 'bad request',
      status: 400,
      stack: 'stacktrace',
    })
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should render error page with error message if not in production', () => {
    const handler = createErrorHandler(true)

    error = {
      status: 400,
      message: 'bad request',
      stack: 'stacktrace',
    } as HTTPError

    handler(error, req, res, jest.fn)

    expect(res.render).toHaveBeenCalledWith('pages/error', {
      message: 'Something went wrong. The error has been logged. Please try again',
      status: 400,
      stack: null,
    })
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should set status to 500 if status not supplied in error', () => {
    const handler = createErrorHandler(true)

    error = {
      message: 'error',
      stack: 'stacktrace',
    } as HTTPError

    handler(error, req, res, jest.fn)

    expect(res.render).toHaveBeenCalledWith('pages/error', {
      message: 'Something went wrong. The error has been logged. Please try again',
      stack: null,
    })
    expect(res.status).toHaveBeenCalledWith(500)
  })
})
