import { Request, Response } from 'express'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceService from '../../../services/licenceService'

export default class ViewVariationRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals

    // If already in progress jump directly to check your answers to continue editing
    if (licence.statusCode === LicenceStatus.VARIATION_IN_PROGRESS) {
      return res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
    }

    // Setup the calls to action for the following forms
    const shouldShowVaryButton = [LicenceStatus.ACTIVE].includes(<LicenceStatus>licence.statusCode)
    const shouldShowPrintButton = [LicenceStatus.VARIATION_APPROVED].includes(<LicenceStatus>licence.statusCode)
    const shouldShowEditAndDiscardButton = [
      LicenceStatus.VARIATION_SUBMITTED,
      LicenceStatus.VARIATION_APPROVED,
      LicenceStatus.VARIATION_REJECTED,
    ].includes(<LicenceStatus>licence.statusCode)

    if (
      licence.statusCode === LicenceStatus.VARIATION_SUBMITTED ||
      licence.statusCode === LicenceStatus.VARIATION_REJECTED ||
      licence.statusCode === LicenceStatus.VARIATION_APPROVED
    ) {
      // If submitted or rejected view the variation summary and approval conversation
      const [conversation, conditionComparison] = await Promise.all([
        this.licenceService.getApprovalConversation(licence, user),
        this.licenceService.compareVariationToOriginal(licence, user),
      ])

      return res.render(`pages/vary/viewSubmitted`, {
        conversation,
        conditionComparison,
        callToActions: { shouldShowVaryButton, shouldShowPrintButton, shouldShowEditAndDiscardButton },
      })
    }

    // Viewing an ACTIVE licence - show conditions and prompt to vary
    const expandedLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
    const expandedPssConditions = expandAdditionalConditions(licence.additionalPssConditions)

    return res.render('pages/vary/viewVariation', {
      expandedLicenceConditions,
      expandedPssConditions,
      callToActions: { shouldShowVaryButton, shouldShowPrintButton, shouldShowEditAndDiscardButton },
    })
  }
}
