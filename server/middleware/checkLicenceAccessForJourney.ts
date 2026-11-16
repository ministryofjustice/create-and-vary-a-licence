import { RequestHandler } from 'express'
import LicenceService from '../services/licenceService'
import AuditService from '../services/audit/auditService'
import checkLicenceAccess from './checkLicenceAccessMiddleware'
import hdcInterruptMiddleware from './hdcInterruptMiddleware'

export default function checkLicenceAccessForJourney(
  auditService: AuditService,
  licenceService: LicenceService,
): RequestHandler[] {
  return [checkLicenceAccess(auditService, licenceService), hdcInterruptMiddleware()]
}
