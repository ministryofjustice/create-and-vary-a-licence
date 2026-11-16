import { RequestHandler } from 'express'
import UserType from '../enumeration/userType'
import LicenceKind from '../enumeration/LicenceKind'
import logger from '../../logger'
import AuditService from '../services/audit/auditService'

export default function timeServedCheckMiddleware(auditService: AuditService, userType: UserType): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals
    // Prison should be able to access initial appointment update pages in time served, and probation should only be able to access
    // outside of time served
    if (licence.kind !== LicenceKind.TIME_SERVED && userType === UserType.PRISON) {
      logger.error('Access denied to prison user due to time served middleware')
      await auditService.logPageAccessFailure(req, licence, res.locals.user)
      return res.redirect('/access-denied')
    }

    if (licence.kind === LicenceKind.TIME_SERVED && userType === UserType.PROBATION) {
      logger.error('Access denied to probation user due to time served middleware')
      await auditService.logPageAccessFailure(req, licence, res.locals.user)
      return res.redirect('/access-denied')
    }

    return next()
  }
}
