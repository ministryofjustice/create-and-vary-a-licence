import { Request, Response } from 'express'
import rolloutMiddleware from './rolloutMiddleware'
import config from '../config'

const req = {} as Request
const next = jest.fn()

const middleware = rolloutMiddleware()

beforeEach(() => {
  jest.resetAllMocks()
  config.rollout.restricted = true
  req.url = '/'
})

describe('rolloutMiddleware', () => {
  it('should allow any GET to the rollout-status page', async () => {
    const res = getProbationRes('UNKNOWN')
    req.method = 'GET'
    req.url = '/rollout-status'
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(res.redirect).not.toBeCalled()
  })

  it('should allow GET when a probation user is inside the rollout areas', async () => {
    const res = getProbationRes('N55')
    req.method = 'GET'
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(res.redirect).not.toBeCalled()
  })

  it('should redirect when a probation user is outside the rollout areas', async () => {
    const res = getProbationRes('N50')
    req.method = 'GET'
    middleware(req, res, next)
    expect(res.redirect).toBeCalledTimes(1)
    expect(next).not.toBeCalled()
  })

  it('should allow GET when a prison user is inside the rollout establishments', async () => {
    const res = getPrisonRes(['MDI'])
    req.method = 'GET'
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(res.redirect).not.toBeCalled()
  })

  it('should redirect when a prison user is outside the rollout areas', async () => {
    const res = getPrisonRes(['MADE-UP-PRISON'])
    req.method = 'GET'
    middleware(req, res, next)
    expect(res.redirect).toBeCalledTimes(1)
    expect(next).not.toBeCalled()
  })

  it('should allow GET for any auth users regardless', async () => {
    const res = getAuthRes()
    req.method = 'GET'
    middleware(req, res, next)
    expect(next).toBeCalledTimes(1)
    expect(res.redirect).not.toBeCalled()
  })
})

const getPrisonRes = (prisonCaseload: string[]): Response => {
  return {
    locals: {
      user: {
        username: 'TEST',
        authSource: 'nomis',
        prisonCaseload,
      },
    },
    redirect: jest.fn(),
  } as unknown as Response
}

const getProbationRes = (probationArea: string): Response => {
  return {
    locals: {
      user: {
        username: 'TEST',
        authSource: 'delius',
        probationArea,
      },
    },
    redirect: jest.fn(),
  } as unknown as Response
}

const getAuthRes = (): Response => {
  return {
    locals: {
      user: {
        username: 'TEST',
        authSource: 'auth',
      },
    },
    redirect: jest.fn(),
  } as unknown as Response
}
