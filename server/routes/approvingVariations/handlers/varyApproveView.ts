import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class VaryApproveViewRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals

    // Check whether this licence variation is still in a VARIATION_SUBMITTED state - e.g. if the back button is pressed
    if (licence?.statusCode === LicenceStatus.VARIATION_SUBMITTED) {
      await this.licenceService.recordAuditEvent(
        `Licence variation approval viewed for ${licence?.forename} ${licence?.surname}`,
        `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
        licence?.id,
        new Date(),
        user,
      )

      // Get the COM/ACO conversation so far and the differences from the original licence
      const [conversation, conditionComparison] = await Promise.all([
        this.licenceService.getApprovalConversation(licence, user),
        this.licenceService.compareVariationToOriginal(licence, user),
      ])

      res.render('pages/vary-approve/view', {
        conversation,
        conditionComparison,
      })
    } else {
      res.redirect(`/licence/vary-approve/list`)
    }
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId } = req.params
    await this.licenceService.approveVariation(licenceId, user)
    res.redirect(`/licence/vary-approve/id/${licenceId}/approve`)
  }
}
