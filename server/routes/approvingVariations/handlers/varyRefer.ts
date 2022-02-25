import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class VaryReferRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    if (licence?.statusCode === LicenceStatus.VARIATION_SUBMITTED) {
      res.render('pages/vary-approve/request-changes')
    } else {
      res.redirect(`/licence/vary-approve/list`)
    }
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId } = req.params
    const { reasonForReferral } = req.body
    await this.licenceService.referVariation(licenceId, { reasonForReferral }, user)
    res.redirect(`/licence/vary-approve/id/${licenceId}/refer-confirm`)
  }
}
