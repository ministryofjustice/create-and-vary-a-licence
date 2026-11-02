import { Request, Response } from 'express'
import hdcInterruptMiddleware from './hdcInterruptMiddleware'
import config from '../config'
import { Licence } from '../@types/licenceApiClientTypes'
import { User } from '../@types/CvlUserDetails'
import LicenceKind from '../enumeration/LicenceKind'
import LicenceStatus from '../enumeration/licenceStatus'
import AuthRole from '../enumeration/authRole'

describe('hdcInterruptMiddleware', () => {
  const middleware = hdcInterruptMiddleware()
  const originalHdcCreationEnabled = config.hdc.hdcCreationEnabled
  let req: Request
  let res: Response
  const next = jest.fn()

  beforeEach(() => {
    config.hdc.hdcCreationEnabled = true
    req = { method: 'GET', path: '/licence/create/id/1/check-your-answers' } as Request
    res = {
      locals: {
        user: { isProbationUser: true, userRoles: [AuthRole.RESPONSIBLE_OFFICER] },
        licence: {
          id: 1,
          kind: LicenceKind.HDC,
          statusCode: LicenceStatus.IN_PROGRESS,
          isReplacementForOptedInLicence: true,
          hdcAddressChecksComplete: false,
        },
      },
      redirect: jest.fn(),
    } as unknown as Response
    next.mockReset()
  })

  afterEach(() => {
    config.hdc.hdcCreationEnabled = originalHdcCreationEnabled
  })

  it.each([
    '/licence/create/id/1/check-your-answers',
    '/licence/create/id/1/edit',
    '/licence/create/id/1/initial-meeting',
    '/licence/view/id/1/show',
  ])('redirects a COM visiting %s to the interrupt', path => {
    middleware({ ...req, path } as Request, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/interrupt')
    expect(next).not.toHaveBeenCalled()
  })

  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'])('blocks %s even on the interrupt route', method => {
    middleware({ ...req, method, path: '/licence/create/id/1/interrupt' } as Request, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(next).not.toHaveBeenCalled()
  })

  it('blocks licence updates', () => {
    middleware({ ...req, method: 'POST' } as Request, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(next).not.toHaveBeenCalled()
  })

  it.each([
    { isProbationUser: false, userRoles: [AuthRole.RESPONSIBLE_OFFICER] },
    { isProbationUser: true, userRoles: [AuthRole.ASSISTANT_CHIEF] },
    { isProbationUser: true, userRoles: [AuthRole.READONLY] },
    { isProbationUser: true, userRoles: undefined },
  ])('leaves other users unaffected: %o', user => {
    res.locals.user = user as User
    middleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it.each([
    { hdcAddressChecksComplete: true },
    { hdcAddressChecksComplete: undefined },
    { statusCode: LicenceStatus.SUBMITTED },
    { kind: LicenceKind.CRD },
    { isReplacementForOptedInLicence: false },
  ])('leaves licences without the interrupt unaffected: %o', changes => {
    res.locals.licence = { ...res.locals.licence, ...changes } as Licence
    middleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('does nothing when HDC creation is disabled', () => {
    config.hdc.hdcCreationEnabled = false
    middleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('does nothing when no licence is populated', () => {
    delete res.locals.licence
    middleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.redirect).not.toHaveBeenCalled()
  })
})
