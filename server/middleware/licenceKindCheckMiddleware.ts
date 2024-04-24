import { RequestHandler } from 'express'
import logger from '../../logger'
import LicenceKind from '../enumeration/LicenceKind'

export default function licenceKindCheckMiddleware(kindToExclude: LicenceKind): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals

    if (licence.kind === kindToExclude) {
      logger.error(`Access denied due to licence kind middleware, blocking kind: ${licence.kind}`)
      return res.redirect('/access-denied')
    }

    return next()
  }
}
