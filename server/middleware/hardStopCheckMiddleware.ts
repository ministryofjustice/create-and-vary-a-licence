import { RequestHandler } from 'express'
import UserType from '../enumeration/userType'
import { isInHardStopPeriod } from '../utils/utils'
import logger from '../../logger'

export default function hardStopCheckMiddleware(userType: UserType): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals
    // Prison should be able to access initial appointment update pages in hard stop, and probation should only be able to access
    // outside of hard stop

    if (!isInHardStopPeriod(licence) && userType === UserType.PRISON) {
      logger.error('Access denied to prison user due to hard stop middleware')
      return res.redirect('/access-denied')
    }
    if (isInHardStopPeriod(licence) && userType === UserType.PROBATION) {
      logger.error('Access denied to probation user due to hard stop middleware')
      return res.redirect('/access-denied')
    }

    return next()
  }
}
