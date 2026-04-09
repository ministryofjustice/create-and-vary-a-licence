import type { RequestHandler } from 'express'
import { LicenceKind } from '../enumeration'
import logger from '../../logger'

export default function hdcActualDateCheckMiddleware(): RequestHandler {
  return (req, res, next) => {
    const { licence } = res.locals

    const isHDC = licence.kind === LicenceKind.HDC
    const noActualDate = !licence.homeDetentionCurfewActualDate

    if (isHDC && noActualDate) {
      logger.error(`Access denied: HDC licence missing homeDetentionCurfewActualDate (licenceId=${licence.id})`)
      return res.redirect('/access-denied')
    }

    return next()
  }
}
