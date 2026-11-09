import type { RequestHandler } from 'express'
import { LicenceKind } from '../enumeration'
import logger from '../../logger'
import AuditService from '../services/audit/auditService'

export default function hdcActualDateCheckMiddleware(auditService: AuditService): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals

    const isHDC = licence.kind === LicenceKind.HDC
    const noActualDate = isHDC && !licence.homeDetentionCurfewActualDate

    if (isHDC && noActualDate) {
      logger.error(`Access denied: HDC licence missing homeDetentionCurfewActualDate (licenceId=${licence.id})`)
      await auditService.logPageAccessFailure(req, licence, res.locals.user)
      return res.redirect('/access-denied')
    }

    return next()
  }
}
