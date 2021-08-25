import type { Request, Response, NextFunction } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)

    if (error.status === 401 || error.status === 403) {
      logger.info('Logging user out')
      return res.redirect('/logout')
    }

    res.status(error.status || 500)

    return res.render('pages/error', {
      message: production ? 'Something went wrong. The error has been logged. Please try again' : error.message,
      status: error.status,
      stack: production ? null : error.stack,
    })
  }
}
