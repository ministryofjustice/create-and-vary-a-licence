import { RequestHandler } from 'express'
import UserType from '../enumeration/userType'
import { isInHardStopPeriod } from '../utils/utils'
import logger from '../../logger'
import AuditService from '../services/audit/auditService'

export default function hardStopCheckMiddleware(auditService: AuditService, userType: UserType): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals

    // Prison should only be able to access initial appointment update pages in hard stop, and probation should only be able to access
    // outside of hard stop
    if (!isInHardStopPeriod(licence) && userType === UserType.PRISON) {
      logger.error('Access denied to prison user due to hard stop middleware')
      await auditService.logPageAccessFailure(req, licence, res.locals.user)
      return res.redirect('/access-denied')
    }

    if (isInHardStopPeriod(licence) && userType === UserType.PROBATION) {
      logger.error('Access denied to probation user due to hard stop middleware')
      await auditService.logPageAccessFailure(req, licence, res.locals.user)
      return res.redirect('/access-denied')
    }

    return next()
  }
}
