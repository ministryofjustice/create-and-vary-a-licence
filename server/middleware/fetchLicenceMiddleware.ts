import { RequestHandler } from 'express'
import LicenceService from '../services/licenceService'

export default function fetchLicence(licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    if (req.method === 'GET' && req.params.licenceId) {
      const { username } = res.locals.user
      const licence = await licenceService.getLicence(req.params.licenceId, username)

      if (licence) {
        res.locals.licence = licence
      }
    }
    next()
  }
}
