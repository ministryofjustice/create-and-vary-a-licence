import { Request, Response } from 'express'
import HdcCurfewAddressService from '../../../../services/hdc/hdcCurfewAddressService'

export default class ResidentialChecksIncompleteReasonRoutes {
  constructor(private readonly hdcCurfewAddressService: HdcCurfewAddressService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/hdc/residentialChecksIncompleteReason')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { reason } = req.body
    const fromReview = Boolean(req.query?.fromReview)

    req.session.curfewAddressChecksIncompleteReason = reason

    if (fromReview) {
      await this.hdcCurfewAddressService.updateResidentialChecks(licence, false, reason, user)
    }

    const basePath = `/licence/${fromReview ? 'create' : 'vary'}/id/${licence.id}`

    return res.redirect(fromReview ? `${basePath}/check-your-answers` : `${basePath}/hdc/find-the-new-curfew-address`)
  }
}
