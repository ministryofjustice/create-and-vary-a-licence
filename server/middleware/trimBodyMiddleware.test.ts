import { Request, Response } from 'express'
import trimRequestBody from './trimBodyMiddleware'

const req = {} as Request
const res = {} as unknown as Response
const next = jest.fn()

const middleware = trimRequestBody()

beforeEach(() => {
  jest.resetAllMocks()
  req.method = 'POST'
})

describe('trimRequestBody', () => {
  it('should pass over a GET request unchanged', async () => {
    req.method = 'GET'
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(req.body).toBeUndefined()
  })

  it('should trim all strings in an object', async () => {
    req.body = {
      test1: '  value1   ',
      test2: '  value2   ',
    }
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(req.body).toEqual({
      test1: 'value1',
      test2: 'value2',
    })
  })

  it('should trim strings inside objects', async () => {
    req.body = {
      test1: {
        test1: '   value1    ',
        test2: '   value2   ',
      },
    }
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(req.body).toEqual({
      test1: {
        test1: 'value1',
        test2: 'value2',
      },
    })
  })

  it('should trim strings inside arrays', async () => {
    req.body = {
      test1: ['   value1   ', '   value2   '],
      test2: [
        {
          test1: '   value1    ',
          test2: '   value2   ',
        },
      ],
    }
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(req.body).toEqual({
      test1: ['value1', 'value2'],
      test2: [
        {
          test1: 'value1',
          test2: 'value2',
        },
      ],
    })
  })

  it('should handle booleans, numbers, null and undefined', async () => {
    req.body = {
      test1: true,
      test2: 2,
    }
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(req.body).toEqual({
      test1: true,
      test2: 2,
    })
  })

  it('should handle null and undefined', async () => {
    req.body = {
      test1: null,
      test2: undefined,
    }
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(req.body).toEqual({
      test1: null,
      test2: undefined,
    })
  })
})
