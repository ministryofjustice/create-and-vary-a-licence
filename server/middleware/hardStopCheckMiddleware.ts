import { RequestHandler } from 'express'
import LicenceKind from '../enumeration/LicenceKind'
import UserType from '../enumeration/userType'
import { isInHardStopPeriod } from '../utils/utils'

export default function hardStopCheckMiddleware(userType: UserType): RequestHandler {
  return async (req, res, next) => {
    const { licence } = res.locals
    // Prison should only be able to access initial appointment update pages in hard stop, and probation should only be able to access
    // outside of hard stop
    if (licence.kind === LicenceKind.VARIATION) {
      return res.redirect('/access-denied')
    }
    if (!isInHardStopPeriod(licence) && userType === UserType.PRISON) {
      return res.redirect('/access-denied')
    }
    if (isInHardStopPeriod(licence) && userType === UserType.PROBATION) {
      return res.redirect('/access-denied')
    }

    return next()
  }
}
