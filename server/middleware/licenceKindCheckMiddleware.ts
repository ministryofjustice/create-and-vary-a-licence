import { RequestHandler } from 'express'
import logger from '../../logger'
import LicenceKind from '../enumeration/LicenceKind'
import AuditService from '../services/audit/auditService'

export default function licenceKindCheckMiddleware(
  auditService: AuditService,
  kindsToExclude: LicenceKind[],
): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals

    if (kindsToExclude.includes(LicenceKind[licence.kind as LicenceKind])) {
      logger.error(`Access denied due to licence kind middleware, blocking kind: ${licence.kind}`)
      await auditService.logPageAccessFailure(req, licence, res.locals.user)
      return res.redirect('/access-denied')
    }

    return next()
  }
}
