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
    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)
    const shouldShowEditAndDiscardButton = [
      LicenceStatus.VARIATION_IN_PROGRESS,
      LicenceStatus.VARIATION_SUBMITTED,
      LicenceStatus.VARIATION_REJECTED,
    ].includes(<LicenceStatus>licence.statusCode)

    const timelineEvents = await this.licenceService.getTimelineEvents(licence, user)

    return res.render(`pages/vary/timeline`, {
      timelineEvents,
      callToActions: { shouldShowVaryButton, shouldShowPrintToActivateButton, shouldShowEditAndDiscardButton },
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals

    // The only POST to this form is the trigger to set approved variations to ACTIVE
    if (licence.statusCode === LicenceStatus.VARIATION_APPROVED) {
      await this.licenceService.updateStatus(licence.id, LicenceStatus.ACTIVE, user)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/timeline`)
  }
}
