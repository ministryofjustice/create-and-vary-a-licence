import { RequestHandler } from 'express'
import getUrlAccessByStatus from '../utils/urlAccessByStatus'
import LicenceService from '../services/licenceService'
import logger from '../../logger'
import { Licence } from '../@types/licenceApiClientTypes'

export default function fetchLicence(licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    if (req.params.licenceId) {
      try {
        const { user } = res.locals
        const licence: Licence = await licenceService.getLicence(parseInt(req.params.licenceId, 10), user)

        if (licence) {
          // Does this prison user have a caseload which allows access this licence?
          if (user?.nomisStaffId) {
            if (!user.prisonCaseload.includes(licence.prisonCode)) {
              logger.info(
                `Prison caseload ${user?.prisonCaseload} denied access to licence ID ${licence.id} ${licence.prisonCode}`,
              )
              return res.redirect('/access-denied')
            }
          }

          /*
           * Does this probation user belong to the team which manages the person on licence?
           * Ignore check if user has the ACO role. This role permits approving licences belonging to
           * team's outside their own
           */
          if (user?.deliusStaffIdentifier) {
            const licenceIsViewableByCom =
              user?.userRoles?.includes('ROLE_LICENCE_ACO') ||
              user?.probationTeamCodes?.includes(licence.probationTeamCode)

            let comCanAccessLicence = false
            if (!licenceIsViewableByCom) {
              comCanAccessLicence = await licenceService.canComAccessLicence(licence.id, user)
            }

            if (!licenceIsViewableByCom && !comCanAccessLicence) {
              logger.info(
                `Probation teams ${user?.probationTeamCodes} denies access to licence ID ${licence.id} ${licence.probationTeamCode}`,
              )

              return res.redirect('/access-denied')
            }
          }

          // Is the URL requested allowed for a licence in this status?
          if (!getUrlAccessByStatus(req.path, licence.id, licence.statusCode, user.username)) {
            logger.info(`URL access denied to licence ID ${licence.statusCode} ${licence.id} ${req.path}`)
            return res.redirect('/access-denied')
          }

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
