import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import logger from '../../../../logger'

export default class ApprovalViewRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    logger.info(`Licence = ${JSON.stringify(res.locals.licence)}`)

    // Check whether this licence is still in a SUBMITTED state - back button pressed or delayed selection
    if (licence && licence?.statusCode && licence?.statusCode !== LicenceStatus.SUBMITTED) {
      res.redirect(`/licence/approve/cases`)
    } else {
      // TODO: Use a nunjucks macro to format these date and time values - don't pass them in here
      const appointmentDate = licence && licence?.appointmentTime ? licence.appointmentTime.substr(0, 10) : null
      const appointmentTime = licence && licence?.appointmentTime ? licence.appointmentTime.substr(11, 5) : null
      res.render('pages/approve/view', { appointmentDate, appointmentTime })
    }
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licenceId, result } = req.body
    switch (result) {
      case 'reject': {
        await this.licenceService.updateStatus(licenceId, LicenceStatus.REJECTED, username)
        res.redirect(`/licence/approve/id/${licenceId}/confirm-rejected`)
        break
      }
      case 'approve': {
        await this.licenceService.updateStatus(licenceId, LicenceStatus.APPROVED, username)
        res.redirect(`/licence/approve/id/${licenceId}/confirm-approved`)
        break
      }
      default:
        // TODO: Cater for a cancel option? No way to avoid approval or rejection at present
        res.redirect(`/licence/approve/cases`)
    }
  }
}
