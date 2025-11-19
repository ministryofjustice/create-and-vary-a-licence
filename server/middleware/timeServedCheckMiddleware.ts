import { RequestHandler } from 'express'
import UserType from '../enumeration/userType'
import logger from '../../logger'

export default function timeServedCheckMiddleware(userType: UserType): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals
    // Prison should only be able to access initial appointment update pages in hard stop and time served, and probation should only be able to access
    // outside of hard stop and time served

    if (licence.kind !== 'TIME_SERVED' && userType === UserType.PRISON) {
      logger.error('Access denied to prison user due to time served middleware')
      return res.redirect('/access-denied')
    }
    if (licence.kind === 'TIME_SERVED' && userType === UserType.PROBATION) {
      logger.error('Access denied to probation user due to time served middleware')
      return res.redirect('/access-denied')
    }

    return next()
  }
}
