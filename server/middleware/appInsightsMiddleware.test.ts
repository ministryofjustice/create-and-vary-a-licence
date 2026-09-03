import type { Request, Response } from 'express'
import type { CorrelationContext } from 'applicationinsights/out/AutoCollection/CorrelationContextManager'
import appInsightsMiddleware from './appInsightsMiddleware'

describe('appInsightsMiddleware', () => {
  const res = {
    prependOnceListener: (event: string, callback: () => void) => {
      if (event === 'finish') {
        callback()
      }
    },
  } as Response

  it('sets operationName when context and route are available', () => {
    const req = {
      method: 'POST',
      route: {
        path: '/test/path',
      },
    } as unknown as Request

    const setPropertyMock = jest.fn()

    const correlationContext: CorrelationContext = {
      operation: {
        name: 'initial name',
        id: 'operation-id',
        parentId: 'parent-id',
      },
      customProperties: {
        setProperty: setPropertyMock,
        getProperty: jest.fn(),
      },
    }

    const next = jest.fn()

    const middleware = appInsightsMiddleware(() => correlationContext)
    middleware(req, res, next)

    expect(setPropertyMock).toHaveBeenCalledWith('operationName', 'POST /test/path')
    expect(next).toHaveBeenCalled()
  })

  it('sets operationName when multiple paths specified', () => {
    const req = {
      method: 'POST',
      route: {
        path: ['/test/path', '/another/path'],
      },
    } as unknown as Request

    const setPropertyMock = jest.fn()

    const correlationContext: CorrelationContext = {
      operation: {
        name: 'initial name',
        id: 'operation-id',
        parentId: 'parent-id',
      },
      customProperties: {
        setProperty: setPropertyMock,
        getProperty: jest.fn(),
      },
    }

    const next = jest.fn()

    const middleware = appInsightsMiddleware(() => correlationContext)
    middleware(req, res, next)

    expect(setPropertyMock).toHaveBeenCalledWith('operationName', 'POST "/test/path" | "/another/path"')
    expect(next).toHaveBeenCalled()
  })

  it('does not set operationName if route info is missing', () => {
    const req = {
      method: 'POST',
    } as unknown as Request

    const setPropertyMock = jest.fn()

    const correlationContext: CorrelationContext = {
      operation: {
        name: 'initial name',
        id: 'operation-id',
        parentId: 'parent-id',
      },
      customProperties: {
        setProperty: setPropertyMock,
        getProperty: jest.fn(),
      },
    }

    const next = jest.fn()

    const middleware = appInsightsMiddleware(() => correlationContext)
    middleware(req, res, next)

    expect(setPropertyMock).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
