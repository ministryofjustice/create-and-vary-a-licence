import { RequestHandler } from 'express'
import LicenceService from '../services/licenceService'
import logger from '../../logger'

export default function fetchLicence(licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    if (req.params.licenceId) {
      const { username } = res.locals.user
      const licence = await licenceService.getLicence(req.params.licenceId, username)

      if (res.locals.user?.nomisStaffId) {
        // Identifies a prison user
        logger.info(`Licence prison ${licence.prisonCode}, user caseload ${res.locals.user.prisonCaseload}`)
        if (res.locals.user.prisonCaseload.includes(licence.prisonCode)) {
          logger.info(`Caseload allows access`)
        } else {
          logger.info(`Caseload denies access`)
          return res.redirect('/access-denied')
        }
      }

      if (res.locals.user?.deliusStaffIdentifier) {
        // Identifies a probation user
        logger.info(`Licence LDU ${licence.probationLduCode}, user LDU ${res.locals.user.probationLduCodes}`)
        if (res.locals.user.probationLduCodes?.includes(licence.probationLduCode)) {
          logger.info(`Probation LDU allows access`)
        } else {
          logger.info(`Probation LDU denies access`)
          return res.redirect('/access-denied')
        }
      }

      // TODO: Is the licence status compatible with the URL requested?
      logger.info(`The licence status is ${licence.statusCode}`)
      logger.info(`The URL requested is ${req.url}`)

      if (licence) {
        res.locals.licence = licence
      }
    }
    return next()
  }
}
