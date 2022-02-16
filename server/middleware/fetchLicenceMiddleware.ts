import { RequestHandler } from 'express'
import getUrlAccessByStatus from '../utils/urlAccessByStatus'
import LicenceService from '../services/licenceService'
import logger from '../../logger'

export default function fetchLicence(licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    if (req.params.licenceId) {
      try {
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

        // Does this probation user belong to the team which manages the person on licence?
        if (licence && user?.deliusStaffIdentifier) {
          if (!user.probationTeamCodes?.includes(licence.probationTeamCode)) {
            logger.info(
              `Probation teams ${user?.probationTeamCodes} denies access to licence ID ${licence.id} ${licence.probationTeamCode}`
            )
            return res.redirect('/access-denied')
          }
        }

        // Is the URL requested allowed for a licence in this status?
        if (licence && !getUrlAccessByStatus(req.path, licence.id, licence.statusCode, user.username)) {
          logger.info(`URL access denied to licence ID ${licence.statusCode} ${licence.id} ${req.path}`)
          return res.redirect('/access-denied')
        }

        if (licence) {
          res.locals.licence = licence
        }
      } catch (error) {
        logger.error(error, `Failed to get licence details for licence Id: ${req.params.licenceId}`)
        return next(error)
      }
    }
    return next()
  }
}
