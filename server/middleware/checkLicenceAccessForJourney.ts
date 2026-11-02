import { RequestHandler } from 'express'
import LicenceService from '../services/licenceService'
import checkLicenceAccess from './checkLicenceAccessMiddleware'
import hdcInterruptMiddleware from './hdcInterruptMiddleware'

export default function checkLicenceAccessForJourney(licenceService: LicenceService): RequestHandler[] {
  return [checkLicenceAccess(licenceService), hdcInterruptMiddleware()]
}
