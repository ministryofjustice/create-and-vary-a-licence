import { Request, Response } from 'express'
import { Licence } from '../@types/licenceApiClientTypes'
import LicenceKind from '../enumeration/LicenceKind'
import hdcActualDateCheckMiddleware from './hdcActualDateCheckMiddleware'
import logger from '../../logger'

let req: Request
let res: Response
const next = jest.fn()

jest.mock('../../logger')

const baseLicence = {
  id: 123,
  kind: LicenceKind.HDC,
} as Licence

beforeEach(() => {
  res = {
    redirect: jest.fn(),
    locals: {
      licence: { ...baseLicence },
    },
  } as unknown as Response

  jest.clearAllMocks()
})

describe('hdcActualDateCheckMiddleware', () => {
  it('should redirect when licence kind is HDC and homeDetentionCurfewActualDate is null', () => {
    res.locals.licence.homeDetentionCurfewActualDate = null

    hdcActualDateCheckMiddleware()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(logger.error).toHaveBeenCalledWith(
      'Access denied: HDC licence missing homeDetentionCurfewActualDate (licenceId=123)',
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('should allow HDC when homeDetentionCurfewActualDate is present', () => {
    res.locals.licence.homeDetentionCurfewActualDate = '2024-01-10'

    hdcActualDateCheckMiddleware()(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should not block non-HDC licences regardless of date', () => {
    res.locals.licence.kind = LicenceKind.CRD
    res.locals.licence.homeDetentionCurfewActualDate = null

    hdcActualDateCheckMiddleware()(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
