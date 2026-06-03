import { Request, Response } from 'express'

export default class ResidentialChecksIncompleteReasonRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/hdc/residentialChecksIncompleteReason')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { reason } = req.body
    const { licenceId } = req.params

    req.session.curfewAddressChecksIncompleteReason = reason

    return res.redirect(`/licence/vary/id/${licenceId}/hdc/find-the-new-curfew-address`)
  }
}
