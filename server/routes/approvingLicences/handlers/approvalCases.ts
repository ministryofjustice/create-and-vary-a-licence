import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import logger from '../../../../logger'

export default class ApprovalCaseRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    logger.info(`Session info - authSource [${res.locals.user?.authSource}]`)
    logger.info(`             - username [${res.locals.user?.username}]`)
    logger.info(`             - displayName [${res.locals.user?.displayName}]`)
    logger.info(`             - name [${res.locals.user?.name}]`)
    logger.info(`             - prisonCaseload [${res.locals.user?.prisonCaseload}]`)
    logger.info(`             - nomisStaffId [${res.locals.user?.nomisStaffId}]`)
    logger.info(`             - activeCaseload [${res.locals.user?.activeCaseload}]`)
    logger.info(`             - emailAddress [${res.locals.user?.emailAddress}]`)

    // TODO: Get prison caseload - this will come from stored values in the user session (populateCurrentUser)
    const prisonCaseload = ['MDI', 'LEI', 'BMI']
    const cases = await this.licenceService.getLicencesForApproval(username, prisonCaseload)
    res.render('pages/approve/cases', { cases })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.body
    res.redirect(`/licence/approve/id/${licenceId}/view`)
  }
}
