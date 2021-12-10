import { RequestHandler } from 'express'
import getUrlAccessByStatus from '../utils/urlAccessByStatus'
import LicenceService from '../services/licenceService'
import logger from '../../logger'

export default function fetchLicence(licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    if (req.params.licenceId) {
      const { user } = res.locals
      const licence = await licenceService.getLicence(req.params.licenceId, user)

      // Does this prison user have a caseload which allows access this licence?
      if (licence && user?.nomisStaffId) {
        if (!user.prisonCaseload.includes(licence.prisonCode)) {
          logger.info(
            `Prison caseload ${user?.prisonCasload} denied access to licence ID ${licence.id} ${licence.prisonCode}`
          )
          return res.redirect('/access-denied')
        }
      }

      // Does this probation user belong to an LDU which manages the person on licence?
      if (licence && user?.deliusStaffIdentifier) {
        if (!user.probationLduCodes?.includes(licence.probationLduCode)) {
          logger.info(
            `Probation LDUs ${user?.probationLduCodes} denies access to licence ID ${licence.id} ${licence.probationLduCode}`
          )
          return res.redirect('/access-denied')
        }
      }

      // Is the URL requested allowed for a licence in this status?
      if (licence && !getUrlAccessByStatus(req.path, licence.id, licence.statusCode, user.username)) {
        return res.redirect('/access-denied')
      }

      if (licence) {
        res.locals.licence = licence
      }
    }
    return next()
  }
}
