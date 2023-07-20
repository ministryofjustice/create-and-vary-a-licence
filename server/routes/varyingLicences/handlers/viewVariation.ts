import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ConditionService from '../../../services/conditionService'
import LicenceService from '../../../services/licenceService'

export default class ViewVariationRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly conditionService: ConditionService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals

    // If already in progress jump directly to check your answers to continue editing
    if (licence.statusCode === LicenceStatus.VARIATION_IN_PROGRESS) {
      if (
        (await this.licenceService.getParentLicenceOrSelf(licence.id, user)).version !==
        (await this.conditionService.getPolicyVersion())
      ) {
        return res.redirect(`/licence/vary/id/${licence.id}/policy-changes`)
      }
      return res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
    }

    // Edit and discard buttons only show for submitted or rejected variations
    const shouldShowEditAndDiscardButton = [
      LicenceStatus.VARIATION_SUBMITTED,
      LicenceStatus.VARIATION_REJECTED,
    ].includes(<LicenceStatus>licence.statusCode)

    // Get the ACO/COM approval conversation
    const [conversation, conditionComparison] = await Promise.all([
      this.licenceService.getApprovalConversation(licence, user),
      this.licenceService.compareVariationToOriginal(licence, user),
    ])

    // Show the variation
    return res.render(`pages/vary/viewSubmitted`, {
      conversation,
      conditionComparison,
      callToActions: { shouldShowEditAndDiscardButton },
    })
  }
}
