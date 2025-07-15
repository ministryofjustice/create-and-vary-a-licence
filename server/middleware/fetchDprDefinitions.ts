import { RequestHandler } from 'express'
import DprService from '../services/dprService'
import logger from '../../logger'

export default function fetchDprDefintions(dprService: DprService): RequestHandler {
  return async (req, res, next) => {
    try {
      const { user } = res.locals
      const reportDefinitions = await dprService.getDefinitions(user)
      res.locals.reportDefinitions = reportDefinitions
    } catch (error) {
      logger.error(error, `Failed to get DPR definitions for: ${res.locals.user?.username}`)
      next(error)
    }
    return next()
  }
}
