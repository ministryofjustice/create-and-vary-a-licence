import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'

export default class VaryApproveViewRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals

    // Check whether this licence variation is still in a VARIATION_SUBMITTED state - e.g. if the back button is pressed
    if (licence?.statusCode === LicenceStatus.VARIATION_SUBMITTED) {
      const expandedLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
      const expandedPssConditions = expandAdditionalConditions(licence.additionalPssConditions)

      // Recorded here as we do not know the reason for the fetchLicence in the API
      await this.licenceService.recordAuditEvent(
        `Licence variation approval viewed for ${licence?.forename} ${licence?.surname}`,
        `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
        licence.id,
        new Date(),
        user
      )

      res.render('pages/vary-approve/view', { expandedLicenceConditions, expandedPssConditions })
    } else {
      res.redirect(`/licence/vary-approve/list`)
    }
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals
    const { licenceId } = req.params

    // TODO: Awaiting a combined API endpoint to change statuses in a transactional method
    // Also clear any referral comments?
    await this.licenceService.updateStatus(`${licence.variationOf}`, LicenceStatus.INACTIVE, user)
    await this.licenceService.updateStatus(licenceId, LicenceStatus.ACTIVE, user)

    res.redirect(`/licence/vary-approve/id/${licenceId}/approve`)
  }
}
