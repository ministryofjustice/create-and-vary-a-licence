import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceService from '../../../services/licenceService'

export default class TimelineRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals

    // Set up call to action buttons based on current licence status
    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)
    const shouldShowPrintButton = [LicenceStatus.VARIATION_APPROVED].includes(<LicenceStatus>licence.statusCode)
    const shouldShowEditAndDiscardButton = [
      LicenceStatus.VARIATION_IN_PROGRESS,
      LicenceStatus.VARIATION_SUBMITTED,
      LicenceStatus.VARIATION_REJECTED,
    ].includes(<LicenceStatus>licence.statusCode)

    const timelineEvents = await this.licenceService.getTimelineEvents(licence, user)

    return res.render(`pages/vary/timeline`, {
      timelineEvents,
      callToActions: { shouldShowVaryButton, shouldShowPrintButton, shouldShowEditAndDiscardButton },
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals

    // TODO: Set a licence which is VARIATION_APPROVED to ACTIVE if the print button is selected.

    return res.redirect(`/licence/vary/id/${licenceId}/timeline`)
  }
}
