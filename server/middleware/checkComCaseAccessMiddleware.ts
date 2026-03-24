import { RequestHandler } from 'express'
import LicenceService from '../services/licenceService'
import logger from '../../logger'
import { CheckCaseAccessRequest } from '../@types/licenceApiClientTypes'

export default function checkComCaseAccessMiddleware(licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    const { user, isVaryJourney } = res.locals

    if (!user?.isProbationUser) {
      return next()
    }

    const { licenceId, nomisId, crn } = req.params
    if (!licenceId && !nomisId && !crn) {
      return next()
    }

    const request: CheckCaseAccessRequest = {
      licenceId: parseInt(licenceId, 10),
      nomisId,
      crn,
    }

    try {
      const caseAccessDetails = await licenceService.checkComCaseAccess(request, user)
      logger.info(`case access details : ${caseAccessDetails}`)
      if (caseAccessDetails.type !== 'NONE') {
        logger.info(`Access denied to restricted case for user ${user.deliusStaffCode}, ${req.path}`)
        if (isVaryJourney) {
          return res.redirect(`/${caseAccessDetails.crn}/restricted?vary=true`)
        }
        return res.redirect(`/${caseAccessDetails.crn}/restricted`)
      }
    } catch (error) {
      return next(error)
    }
    return next()
  }
}
