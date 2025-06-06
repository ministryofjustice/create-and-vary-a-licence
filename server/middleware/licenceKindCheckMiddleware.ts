import { RequestHandler } from 'express'
import logger from '../../logger'
import LicenceKind from '../enumeration/LicenceKind'

export default function licenceKindCheckMiddleware(kindsToExclude: LicenceKind[]): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals

    if (kindsToExclude.includes(LicenceKind[licence.kind as LicenceKind])) {
      logger.error(`Access denied due to licence kind middleware, blocking kind: ${licence.kind}`)
      return res.redirect('/access-denied')
    }

    return next()
  }
}
