import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import TimelineService from '../../../services/timelineService'
import LicenceService from '../../../services/licenceService'

export default class TimelineRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly timelineService: TimelineService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals

    // Set up call to action buttons based on current licence status
    const shouldShowPrintToActivateButton = licence.statusCode === LicenceStatus.VARIATION_APPROVED

    const shouldShowViewOrVaryButton = licence.statusCode === LicenceStatus.ACTIVE && !licence.isReviewNeeded

    const shouldShowEditButton = [
      LicenceStatus.VARIATION_IN_PROGRESS,
      LicenceStatus.VARIATION_SUBMITTED,
      LicenceStatus.VARIATION_REJECTED,
    ].includes(<LicenceStatus>licence.statusCode)

    const timelineEvents = await this.timelineService.getTimelineEvents(licence, user)

    return res.render(`pages/vary/timeline`, {
      timelineEvents,
      callToActions: {
        shouldShowViewOrVaryButton,
        shouldShowPrintToActivateButton,
        shouldShowEditButton,
        shouldShowReviewButton: licence.isReviewNeeded,
      },
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals

    // The POST is the trigger to set the approved variation to ACTIVE and varied licence to INACTIVE
    if (licence.kind === 'VARIATION' && licence.statusCode === LicenceStatus.VARIATION_APPROVED) {
      await this.licenceService.activateVariation(licence.id, user)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/timeline`)
  }
}
