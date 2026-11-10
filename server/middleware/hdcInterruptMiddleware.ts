import { RequestHandler } from 'express'
import config from '../config'
import AuthRole from '../enumeration/authRole'
import { isHdcAddressChecksIncompleteLicence } from '../utils/utils'
import logger from '../../logger'

export default function hdcInterruptMiddleware(): RequestHandler {
  return (req, res, next) => {
    const { user, licence } = res.locals
    if (
      !config.hdc.hdcCreationEnabled ||
      !licence ||
      !user?.isProbationUser ||
      !user.userRoles?.includes(AuthRole.RESPONSIBLE_OFFICER) ||
      !isHdcAddressChecksIncompleteLicence(licence)
    ) {
      return next()
    }

    logger.warn(
      {
        licenceId: licence.id,
        username: user.username,
        method: req.method,
        path: req.originalUrl || req.path,
      },
      'Blocked COM access because HDC address checks are incomplete for an opted-in replacement licence',
    )
    return res.redirect('/access-denied')
  }
}
