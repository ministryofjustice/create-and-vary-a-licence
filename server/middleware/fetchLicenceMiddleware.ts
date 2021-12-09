import { RequestHandler } from 'express'
import LicenceService from '../services/licenceService'

export default function fetchLicence(licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    if (req.params.licenceId) {
      const { user } = res.locals
      const licence = await licenceService.getLicence(req.params.licenceId, user)

      if (licence) {
        res.locals.licence = licence
      }
    }
    next()
  }
}
