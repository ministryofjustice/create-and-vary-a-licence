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

    const interruptPath = `/licence/hdc/create/id/${licence.id}/interrupt`
    if (req.method === 'GET') {
      return res.redirect(interruptPath)
    }

    logger.info(`Access denied while HDC interrupt applies for licence ${licence.id}`)
    return res.redirect('/access-denied')
  }
}
