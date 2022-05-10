import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import CommunityService from '../../../services/communityService'

export default class VariationSummaryRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals

    const [conversation, conditionComparison] = await Promise.all([
      this.licenceService.getApprovalConversation(licence, user),
      this.licenceService.compareVariationToOriginal(licence, user),
    ])

    res.render('pages/vary/variationSummary', {
      conversation,
      conditionComparison,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals

    const pduHeads = await this.communityService.getPduHeads(licence.probationPduCode).then(p =>
      p.map(c => {
        return {
          name: `${c.staff.forenames} ${c.staff.surname}`,
          email: c.email,
        }
      })
    )
    await this.licenceService.submitVariation(licenceId, pduHeads, user)

    return res.redirect(`/licence/vary/id/${licenceId}/confirmation`)
  }
}
