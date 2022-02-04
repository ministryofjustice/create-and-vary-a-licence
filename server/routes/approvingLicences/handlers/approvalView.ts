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
      await this.licenceService.recordAuditEvent(
        `Viewed licence for ${licence.forename} ${licence.surname} for approval`,
        `Viewed licence ID ${licence.id} type ${licence.typeCode} version ${licence.version} for approval`,
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
    const { user, licence } = res.locals
    const { licenceId, result } = req.body
    switch (result) {
      case 'reject': {
        await this.licenceService.updateStatus(licenceId, LicenceStatus.REJECTED, user)
        await this.licenceService.recordAuditEvent(
          `Rejected licence for ${licence.forename} ${licence.surname}`,
          `Rejected licence ID ${licence.id} type ${licence.typeCode} version ${licence.version}`,
          licence.id,
          new Date(),
          user
        )
        res.redirect(`/licence/approve/id/${licenceId}/confirm-rejected`)
        break
      }
      case 'approve': {
        await this.licenceService.updateStatus(licenceId, LicenceStatus.APPROVED, user)
        await this.licenceService.recordAuditEvent(
          `Approved licence for ${licence.forename} ${licence.surname}`,
          `Approved licence ID ${licence.id} type ${licence.typeCode} version ${licence.version}`,
          licence.id,
          new Date(),
          user
        )
        res.redirect(`/licence/approve/id/${licenceId}/confirm-approved`)
        break
      }
      default:
        // Cater for a cancel option? No way to avoid approval or rejection at present
        res.redirect(`/licence/approve/cases`)
    }
  }
}
