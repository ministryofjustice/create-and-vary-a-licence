import { Request, Response } from 'express'

export default class FindNewCurfewAddressRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    res.render('pages/vary/hdc/findNewCurfewAddress', {
      manualAddressEntryUrl: `/licence/vary/id/${licenceId}/hdc/manual-curfew-address-entry`,
    })
  }

  POST = async (_req: Request, res: Response): Promise<void> => {}
}
