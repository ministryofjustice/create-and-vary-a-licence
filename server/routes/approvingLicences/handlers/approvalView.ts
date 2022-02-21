import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'

export default class ApprovalViewRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals

    // Check whether this licence is still in a SUBMITTED state - back button pressed - avoid re-approval
    if (licence?.statusCode === LicenceStatus.SUBMITTED) {
      const expandedLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
      const expandedPssConditions = expandAdditionalConditions(licence.additionalPssConditions)

      // Recorded here as we do not know the reason for the fetchLicence in the API
      await this.licenceService.recordAuditEvent(
        `Licence viewed for approval for ${licence?.forename} ${licence?.surname}`,
        `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
        licence.id,
        new Date(),
        user
      )
      res.render('pages/approve/view', { expandedLicenceConditions, expandedPssConditions })
    } else {
      res.redirect(`/licence/approve/cases`)
    }
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId, result } = req.body
    switch (result) {
      case 'reject': {
        await this.licenceService.updateStatus(licenceId, LicenceStatus.REJECTED, user)
        res.redirect(`/licence/approve/id/${licenceId}/confirm-rejected`)
        break
      }
      case 'approve': {
        await this.licenceService.updateStatus(licenceId, LicenceStatus.APPROVED, user)
        res.redirect(`/licence/approve/id/${licenceId}/confirm-approved`)
        break
      }
      default:
        // Cater for a cancel option? No way to avoid approval or rejection at present
        res.redirect(`/licence/approve/cases`)
    }
  }
}
