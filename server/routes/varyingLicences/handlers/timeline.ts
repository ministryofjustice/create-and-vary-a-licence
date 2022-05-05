import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceService from '../../../services/licenceService'

export default class TimelineRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals

    // Set up call to action buttons based on current licence status
    const shouldShowPrintToActivateButton = [LicenceStatus.VARIATION_APPROVED].includes(
      <LicenceStatus>licence.statusCode
    )

    const shouldShowViewOrVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)

    const shouldShowEditButton = [
      LicenceStatus.VARIATION_IN_PROGRESS,
      LicenceStatus.VARIATION_SUBMITTED,
      LicenceStatus.VARIATION_REJECTED,
    ].includes(<LicenceStatus>licence.statusCode)

    const timelineEvents = await this.licenceService.getTimelineEvents(licence, user)

    return res.render(`pages/vary/timeline`, {
      timelineEvents,
      callToActions: { shouldShowViewOrVaryButton, shouldShowPrintToActivateButton, shouldShowEditButton },
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals

    // The POST is the trigger to set the approved variation to ACTIVE and varied licence to INACTIVE
    if (licence.statusCode === LicenceStatus.VARIATION_APPROVED) {
      await this.licenceService.updateStatus(licence.id, LicenceStatus.ACTIVE, user)
      await this.licenceService.updateStatus(licence.variationOf, LicenceStatus.INACTIVE, user)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/timeline`)
  }
}
