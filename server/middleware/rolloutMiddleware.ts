import { NextFunction, Request, RequestHandler, Response } from 'express'
import { anyPrisonInRollout, probationAreaInRollout } from '../utils/rolloutUtils'
import logger from '../../logger'

export default function rolloutMiddleware(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { user } = res.locals

    if (req.url === '/rollout-status') {
      return next()
    }

    if (user?.authSource === 'nomis' && anyPrisonInRollout(user?.prisonCaseload)) {
      return next()
    }

    if (user?.authSource === 'delius' && probationAreaInRollout(user?.probationArea)) {
      return next()
    }

    if (user?.authSource === 'auth') {
      return next()
    }

    logger.info(`User ${user.username} was redirected to the rollout status page - not in pilot`)

    return res.redirect('/rollout-status')
  }
}
