import { RequestHandler } from 'express'
import logger from '../../logger'
import ProbationService from '../services/probationService'

export default function preLicenceCreationMiddleware(probationService: ProbationService): RequestHandler {
  return async (req, res, next) => {
    if (req.params.nomisId) {
      try {
        const { user } = res.locals
        const { nomisId } = req.params

        const deliusRecord = await probationService.getProbationer({ nomsNumber: nomisId })
        if (deliusRecord) {
          const responsibleCom = await probationService.getResponsibleCommunityManager(deliusRecord.otherIds.crn)
          if (responsibleCom) {
            if (user?.deliusStaffIdentifier && !user.probationTeamCodes?.includes(responsibleCom.team.code)) {
              logger.info(
                `Access denied to create licence for ${nomisId} as ${responsibleCom.team.code} team not present in user probation teams ${user?.probationTeamCodes}`,
              )

              return res.redirect('/access-denied')
            }
          }
        }
      } catch (error) {
        logger.error(error, `Failed to check pre licence creation rules for: ${req.params.nomisId}`)
        return next(error)
      }
    }

    return next()
  }
}
