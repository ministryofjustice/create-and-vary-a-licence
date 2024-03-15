import type { Locals, Request, Response } from 'express'
import checkFlashForErrors from './flashMessageMiddleware'

const flashMock = jest.fn()

const req = { flash: flashMock, body: { reportType: 'counterCorruptionReport' } } as unknown as Request
const res = { redirect: jest.fn(), locals: {} } as unknown as Response
const next = jest.fn()

const middleware = checkFlashForErrors()

beforeEach(() => {
  jest.resetAllMocks()
  req.method = 'GET'
  res.locals = {} as Locals
})

describe('flashMessageMiddleware', () => {
  it('should call next if no errors', async () => {
    middleware(req, res, next)
    expect(res.locals).toEqual({})
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should not read from flash if request method is not GET', async () => {
    flashMock
      .mockReturnValueOnce([JSON.stringify({ val: 'error' })])
      .mockReturnValueOnce([JSON.stringify({ form: 'response' })])

    req.method = 'POST'

    middleware(req, res, next)
    expect(res.locals).toEqual({})
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should set validation errors if they exist', async () => {
    flashMock.mockReturnValueOnce([JSON.stringify({ val: 'error' })])

    middleware(req, res, next)
    expect(res.locals).toMatchObject({ validationErrors: { val: 'error' } })
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should set formResponses if they exist', async () => {
    flashMock.mockReturnValueOnce([JSON.stringify({ form: 'response' })])

    middleware(req, res, next)
    expect(res.locals).toMatchObject({ validationErrors: { form: 'response' } })
    expect(next).toHaveBeenCalledTimes(1)
  })
})
