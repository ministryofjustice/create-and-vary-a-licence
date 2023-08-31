import type { Locals, Request, Response } from 'express'
import fromReviewMiddleware from './fromReviewMiddleware'

const req = {} as Request
const res = { locals: {} } as unknown as Response
const next = jest.fn()

const middleware = fromReviewMiddleware()

beforeEach(() => {
  jest.resetAllMocks()
  req.method = 'GET'
  req.query = {
    fromReview: 'true',
  }
  res.locals = {} as Locals
})

describe('addQueryParameterToViewContext', () => {
  it('should add fromReview to context', async () => {
    middleware(req, res, next)
    expect(res.locals).toEqual({
      fromReview: 'true',
    })
    expect(next).toBeCalledTimes(1)
  })

  it('should not add fromReview to context if query object is undefined', async () => {
    req.query = undefined
    middleware(req, res, next)
    expect(res.locals).toEqual({})
    expect(next).toBeCalledTimes(1)
  })

  it('should not add fromReview to context if request method is not GET', async () => {
    req.method = 'POST'

    middleware(req, res, next)
    expect(res.locals).toEqual({})
    expect(next).toBeCalledTimes(1)
  })
})
