import { RequestHandler } from 'express'
import assert from 'assert'
import logger from '../../logger'
import ProbationService from '../services/probationService'
import AuditService from '../services/audit/auditService'

export default function preLicenceCreationMiddleware(
  auditService: AuditService,
  probationService: ProbationService,
): RequestHandler {
  return async (req, res, next) => {
    assert(req.params.nomisId, 'No nomisId has been provided')

    try {
      const { user } = res.locals
      const { nomisId } = req.params
      const responsibleCom = await probationService.getResponsibleCommunityManager(nomisId)
      if (!responsibleCom || !user?.deliusStaffIdentifier) {
        logger.info(`Access denied to create licence for ${nomisId}`)
        await auditService.logLicenceConfirmCreateFailure(req.id, req.method, nomisId, user)
        return res.redirect('/authError')
      }
      if (!user.probationTeamCodes?.includes(responsibleCom.team.code)) {
        logger.info(
          `Access denied to create licence for ${nomisId} as ${responsibleCom.team.code} team not present in user probation teams ${user?.probationTeamCodes}`,
        )
        await auditService.logLicenceConfirmCreateFailure(req.id, req.method, nomisId, user)
        return res.redirect('/access-denied')
      }
    } catch (error) {
      logger.error(error, `Failed to check pre licence creation rules for: ${req.params.nomisId}`)
      return next(error)
    }

    return next()
  }
}
