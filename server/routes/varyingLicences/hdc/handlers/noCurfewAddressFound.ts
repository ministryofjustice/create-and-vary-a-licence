import { Request, Response } from 'express'

export default class NoCurfewAddressFoundRoutes {
  constructor() {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { searchQuery } = req.query as { searchQuery?: string }
    const basePath = `/licence/vary/id/${licenceId}/hdc`

    return res.render('pages/vary/hdc/noCurfewAddressFound', {
      searchQuery,
      curfewAddressSearchUrl: `${basePath}/find-the-new-curfew-address`,
      manualAddressEntryUrl: `${basePath}/manual-curfew-address-entry`,
    })
  }
}
