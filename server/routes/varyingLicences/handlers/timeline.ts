import type { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import TimelineService from '../../../services/timelineService'
import LicenceService from '../../../services/licenceService'
import type { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'

enum CallToActionType {
  PRINT_TO_ACTIVATE = 'PRINT_TO_ACTIVATE',
  EDIT = 'EDIT',
  REVIEW = 'REVIEW',
  VIEW_OR_VARY = 'VIEW_OR_VARY',
  VIEW = 'VIEW',
}

const { VARIATION_APPROVED, ACTIVE, VARIATION_IN_PROGRESS, VARIATION_REJECTED, VARIATION_SUBMITTED } = LicenceStatus
const { PRINT_TO_ACTIVATE, EDIT, VIEW_OR_VARY, REVIEW, VIEW } = CallToActionType

export default class TimelineRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly timelineService: TimelineService,
  ) {}

  getCtaType = (licence: Licence): CallToActionType => {
    if (licence.statusCode === VARIATION_APPROVED) {
      return PRINT_TO_ACTIVATE
    }
    if (licence.statusCode === ACTIVE && !licence.isReviewNeeded && licence.kind !== LicenceKind.HDC) {
      return VIEW_OR_VARY
    }

    if (licence.statusCode === ACTIVE && !licence.isReviewNeeded && licence.kind === LicenceKind.HDC) {
      return VIEW
    }

    if ([VARIATION_IN_PROGRESS, VARIATION_SUBMITTED, VARIATION_REJECTED].includes(<LicenceStatus>licence.statusCode)) {
      return EDIT
    }

    if (licence.isReviewNeeded) {
      return REVIEW
    }
    return null
  }

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals

    const timelineEvents = await this.timelineService.getTimelineEvents(licence, user)

    return res.render(`pages/vary/timeline`, {
      timelineEvents,
      callToAction: this.getCtaType(licence),
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
