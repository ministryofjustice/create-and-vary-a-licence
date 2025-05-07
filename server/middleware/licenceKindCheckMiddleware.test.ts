import { Request, Response } from 'express'
import { Licence } from '../@types/licenceApiClientTypes'
import LicenceKind from '../enumeration/LicenceKind'
import licenceKindCheckMiddleware from './licenceKindCheckMiddleware'
import logger from '../../logger'

let req: Request
let res: Response
const next = jest.fn()

jest.mock('../../logger')

const licence = {
  kind: LicenceKind.VARIATION,
} as Licence

beforeEach(() => {
  res = {
    redirect: jest.fn(),
    locals: {
      licence,
    },
  } as unknown as Response
})

describe('licenceKindCheckMiddleware', () => {
  it('should redirect licences with the supplied kind to access-denied', () => {
    licenceKindCheckMiddleware([LicenceKind.VARIATION])(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    expect(logger.error).toHaveBeenCalledWith('Access denied due to licence kind middleware, blocking kind: VARIATION')
    expect(next).not.toHaveBeenCalled()
  })

  it('should not redirect licences with a different kind to the one supplied', () => {
    licenceKindCheckMiddleware([LicenceKind.CRD])(req, res, next)
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
