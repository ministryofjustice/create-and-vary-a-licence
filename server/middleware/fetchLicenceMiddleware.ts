import { RequestHandler } from 'express'
import getUrlAccessByStatus from '../utils/urlAccessByStatus'
import LicenceService from '../services/licenceService'
import logger from '../../logger'

export default function fetchLicence(licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    if (req.params.licenceId) {
      const { username } = res.locals.user
      const licence = await licenceService.getLicence(req.params.licenceId, username)

      // Does this prison user have a caseload which allows access this licence?
      if (licence && res.locals.user?.nomisStaffId) {
        if (!res.locals.user.prisonCaseload.includes(licence.prisonCode)) {
          logger.info(`Caseload denies access to licence ID ${licence.id}`)
          return res.redirect('/access-denied')
        }
      }

      // Does this probation user belong to an LDU which manages the person on licence?
      if (licence && res.locals.user?.deliusStaffIdentifier) {
        if (!res.locals.user.probationLduCodes?.includes(licence.probationLduCode)) {
          logger.info(`Probation LDU denies access to licence ID ${licence.id}`)
          return res.redirect('/access-denied')
        }
      }

      // Is the URL requested allowed for a licence in this status?
      if (licence && !getUrlAccessByStatus(req.path, licence.id, licence.statusCode, username)) {
        return res.redirect('/access-denied')
      }

      if (licence) {
        res.locals.licence = licence
      }
    }
    return next()
  }
}
